import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostKind, PostType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReputationService } from '../reputation/reputation.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { FeedQueryDto } from './dto/query.dto';

const POST_AUTHOR_SELECT = {
  select: {
    id: true,
    reputationPoints: true,
    profile: { select: { fullName: true, username: true, avatarUrl: true } },
  },
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
    private readonly reputation: ReputationService,
  ) {}

  private async actorName(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { fullName: true },
    });
    return profile?.fullName ?? 'Someone';
  }

  async createPost(userId: string, slug: string, dto: CreatePostDto, role = 'STUDENT') {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    // Members-only posting for non-public communities.
    if (community.visibility !== 'PUBLIC' && !member) {
      throw new ForbiddenException('Join the community to post');
    }
    // Moderation: banned/muted members cannot post.
    if (member?.bannedAt) throw new ForbiddenException('You are banned from this community');
    if (member?.mutedUntil && member.mutedUntil > new Date()) {
      throw new ForbiddenException('You are muted in this community');
    }
    // Announcements may only be posted by community heads/mods (or platform admins).
    if (dto.kind === 'ANNOUNCEMENT') {
      const isPrivileged =
        role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR';
      if (!isPrivileged && (!member || member.role === 'MEMBER')) {
        throw new ForbiddenException('Only community heads can post announcements');
      }
    }

    const type = dto.poll ? PostType.POLL : dto.type ?? PostType.TEXT;

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          communityId: community.id,
          authorId: userId,
          type,
          ...(dto.kind ? { kind: dto.kind } : {}),
          title: dto.title,
          body: dto.body,
          attachments: dto.attachments ?? [],
          linkUrl: dto.linkUrl,
          hashtags: dto.hashtags ?? [],
          mentions: dto.mentions ?? [],
          ...(dto.poll
            ? {
                poll: {
                  create: {
                    question: dto.poll.question,
                    multiple: dto.poll.multiple ?? false,
                    expiresAt: dto.poll.expiresAt ? new Date(dto.poll.expiresAt) : null,
                    options: { create: dto.poll.options.map((text) => ({ text })) },
                  },
                },
              }
            : {}),
        },
        include: { author: POST_AUTHOR_SELECT, poll: { include: { options: true } } },
      });
      await tx.community.update({
        where: { id: community.id },
        data: { postCount: { increment: 1 } },
      });
      return created;
    });

    await this.reputation.award(userId, 'POST_CREATED', { refType: 'post', refId: post.id });
    return post;
  }

  async getFeed(slug: string, query: FeedQueryDto, userId?: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    const sortBy: Prisma.PostOrderByWithRelationInput =
      query.sort === 'top' ? { likeCount: 'desc' } : { createdAt: 'desc' };
    // Pinned posts surface first.
    const orderBy: Prisma.PostOrderByWithRelationInput[] = [{ isPinned: 'desc' }, sortBy];

    // Section filters map the single feed into the community's tabs.
    const sectionWhere: Prisma.PostWhereInput =
      query.section === 'ANNOUNCEMENTS'
        ? { kind: PostKind.ANNOUNCEMENT }
        : query.section === 'POLLS'
          ? { type: PostType.POLL }
          : query.section === 'DISCUSSION'
            ? { kind: { not: PostKind.ANNOUNCEMENT }, type: { not: PostType.POLL } }
            : {};

    const posts = await this.prisma.post.findMany({
      where: { communityId: community.id, status: 'PUBLISHED', deletedAt: null, ...sectionWhere },
      orderBy,
      take: query.limit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
      include: {
        author: POST_AUTHOR_SELECT,
        poll: { include: { options: true } },
        // Per-user flags resolved without N+1 via filtered relations.
        reactions: userId ? { where: { userId }, select: { id: true } } : false,
        bookmarks: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    const shaped = posts.map((p) => {
      const { reactions, bookmarks, ...rest } = p as typeof p & {
        reactions?: unknown[];
        bookmarks?: unknown[];
      };
      return {
        ...rest,
        likedByMe: Array.isArray(reactions) && reactions.length > 0,
        savedByMe: Array.isArray(bookmarks) && bookmarks.length > 0,
      };
    });

    return buildPaginatedResult(shaped, query);
  }

  async getPost(id: string, userId?: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: POST_AUTHOR_SELECT,
        poll: { include: { options: true } },
        community: { select: { id: true, name: true, slug: true } },
        reactions: userId ? { where: { userId }, select: { id: true } } : false,
        bookmarks: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    const { reactions, bookmarks, ...rest } = post as typeof post & {
      reactions?: unknown[];
      bookmarks?: unknown[];
    };
    return {
      ...rest,
      likedByMe: Array.isArray(reactions) && reactions.length > 0,
      savedByMe: Array.isArray(bookmarks) && bookmarks.length > 0,
    };
  }

  async deletePost(id: string, userId: string, role: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    const isPrivileged = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR';
    if (post.authorId !== userId && !isPrivileged) {
      throw new ForbiddenException('Cannot delete this post');
    }
    await this.prisma.$transaction([
      this.prisma.post.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'REMOVED' },
      }),
      this.prisma.community.update({
        where: { id: post.communityId },
        data: { postCount: { decrement: 1 } },
      }),
    ]);
    return { deleted: true };
  }

  /** Pin/unpin a post. Allowed for global admins/mods or the community's mods. */
  async togglePin(postId: string, userId: string, role: string) {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');

    const isGlobalPrivileged =
      role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR';
    if (!isGlobalPrivileged) {
      const member = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: post.communityId, userId } },
      });
      if (!member || member.role === 'MEMBER') {
        throw new ForbiddenException('Moderator privileges required to pin');
      }
    }
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { isPinned: !post.isPinned },
      select: { id: true, isPinned: true },
    });
    return updated;
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.reaction.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.reaction.delete({ where: { id: existing.id } }),
        this.prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } }),
      ]);
      return { liked: false };
    }
    await this.prisma.$transaction([
      this.prisma.reaction.create({ data: { userId, postId, type: 'LIKE' } }),
      this.prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
    ]);

    await this.notifications.create({
      recipientId: post.authorId,
      actorId: userId,
      type: 'LIKE',
      title: `${await this.actorName(userId)} liked your post`,
      data: { postId },
    });
    // Reward the post author for receiving a like (not self-likes).
    if (post.authorId !== userId) {
      await this.reputation.award(post.authorId, 'RECEIVED_LIKE', { refType: 'post', refId: postId });
    }
    return { liked: true };
  }

  async toggleBookmark(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      await this.prisma.$transaction([
        this.prisma.bookmark.delete({ where: { id: existing.id } }),
        this.prisma.post.update({ where: { id: postId }, data: { saveCount: { decrement: 1 } } }),
      ]);
      return { saved: false };
    }
    await this.prisma.$transaction([
      this.prisma.bookmark.create({ data: { userId, postId } }),
      this.prisma.post.update({ where: { id: postId }, data: { saveCount: { increment: 1 } } }),
    ]);
    return { saved: true };
  }

  async sharePost(postId: string) {
    const post = await this.prisma.post.updateMany({
      where: { id: postId, deletedAt: null },
      data: { shareCount: { increment: 1 } },
    });
    if (post.count === 0) throw new NotFoundException('Post not found');
    return { shared: true };
  }

  async votePoll(postId: string, userId: string, optionIds: string[]) {
    const poll = await this.prisma.poll.findUnique({
      where: { postId },
      include: { options: true },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.expiresAt && poll.expiresAt < new Date()) {
      throw new ForbiddenException('Poll has expired');
    }
    const validIds = new Set(poll.options.map((o) => o.id));
    const chosen = optionIds.filter((id) => validIds.has(id));
    if (chosen.length === 0) throw new NotFoundException('Invalid poll option');
    if (!poll.multiple && chosen.length > 1) {
      throw new ForbiddenException('This poll allows a single choice only');
    }

    // Remove any previous votes by this user (re-vote), then record new ones.
    const previous = await this.prisma.pollVote.findMany({
      where: { pollId: poll.id, userId },
    });

    await this.prisma.$transaction([
      ...previous.map((v) =>
        this.prisma.pollOption.update({
          where: { id: v.pollOptionId },
          data: { voteCount: { decrement: 1 } },
        }),
      ),
      this.prisma.pollVote.deleteMany({ where: { pollId: poll.id, userId } }),
      ...chosen.map((optionId) =>
        this.prisma.pollVote.create({
          data: { pollId: poll.id, pollOptionId: optionId, userId },
        }),
      ),
      ...chosen.map((optionId) =>
        this.prisma.pollOption.update({
          where: { id: optionId },
          data: { voteCount: { increment: 1 } },
        }),
      ),
    ]);

    return this.prisma.poll.findUnique({ where: { id: poll.id }, include: { options: true } });
  }
}
