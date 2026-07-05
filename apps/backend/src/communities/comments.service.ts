import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReputationService } from '../reputation/reputation.service';
import { buildPaginatedResult, PaginationDto } from '../common/dto/pagination.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { isPlatformAdmin, roleHasCapability } from './community-permissions';

const COMMENT_AUTHOR_SELECT = {
  select: {
    id: true,
    profile: {
      select: {
        fullName: true,
        username: true,
        avatarUrl: true,
        collegeVerification: true,
        college: { select: { name: true } },
      },
    },
  },
};

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly reputation: ReputationService,
  ) {}

  /** Moderation gate — Moderator / Campus Lead / community admin, or platform admin/mod. */
  private async assertCanModerate(communityId: string, userId: string, role: string) {
    if (isPlatformAdmin(role) || role === 'MODERATOR') return;
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!roleHasCapability(member?.role, 'MODERATE')) {
      throw new ForbiddenException('Moderator privileges required');
    }
  }

  async createComment(postId: string, userId: string, dto: CreateCommentDto, role = 'STUDENT') {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');

    // Same gate as posting: must be a member and not banned/muted (platform
    // admins exempt). Otherwise banned/muted users kept participating via comments.
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: post.communityId, userId } },
    });
    if (!member && !isPlatformAdmin(role)) {
      throw new ForbiddenException('Join the community to comment');
    }
    if (member?.bannedAt) throw new ForbiddenException('You are banned from this community');
    if (member?.mutedUntil && member.mutedUntil > new Date()) {
      throw new ForbiddenException('You are muted in this community');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, postId, deletedAt: null },
      });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          postId,
          authorId: userId,
          parentId: dto.parentId,
          body: dto.body,
          mentions: dto.mentions ?? [],
        },
        include: { author: COMMENT_AUTHOR_SELECT },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    const actorName = comment.author.profile?.fullName ?? 'Someone';
    // Notify the post author.
    await this.notifications.create({
      recipientId: post.authorId,
      actorId: userId,
      type: 'COMMENT',
      title: `${actorName} commented on your post`,
      body: dto.body.slice(0, 120),
      data: { postId },
    });
    // Notify mentioned users.
    const mentions = (dto.mentions ?? []).filter((id) => id !== userId && id !== post.authorId);
    if (mentions.length) {
      await this.notifications.createMany(mentions, {
        actorId: userId,
        type: 'MENTION',
        title: `${actorName} mentioned you in a comment`,
        body: dto.body.slice(0, 120),
        data: { postId },
      });
    }

    await this.reputation.award(userId, 'COMMENT_CREATED', { refType: 'comment', refId: comment.id });
    return comment;
  }

  async listComments(postId: string, query: PaginationDto, userId?: string, role?: string) {
    // Don't expose a private community's discussion to non-members via comments.
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
      select: { community: { select: { id: true, visibility: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.community.visibility !== 'PUBLIC' && !(role && isPlatformAdmin(role))) {
      const member = userId
        ? await this.prisma.communityMember.findUnique({
            where: { communityId_userId: { communityId: post.community.id, userId } },
          })
        : null;
      if (!member || member.bannedAt) throw new ForbiddenException('This community is private');
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId, parentId: null, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      skip: query.skip,
      take: query.limit,
      include: {
        author: COMMENT_AUTHOR_SELECT,
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 10,
          include: { author: COMMENT_AUTHOR_SELECT },
        },
      },
    });
    return buildPaginatedResult(comments, query);
  }

  async deleteComment(id: string, userId: string, role: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { post: { select: { communityId: true } } },
    });
    if (!comment || comment.deletedAt) throw new NotFoundException('Comment not found');
    // Authors delete their own; otherwise it's a moderation action scoped to the
    // comment's community (Campus Lead / community moderator), not any platform role.
    if (comment.authorId !== userId) {
      await this.assertCanModerate(comment.post.communityId, userId, role);
    }
    await this.prisma.$transaction([
      this.prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } }),
      this.prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);
    // Reverse the create reward so create→delete can't farm reputation.
    await this.reputation.deduct(comment.authorId, 'COMMENT_CREATED', { refType: 'comment', refId: id });
    return { deleted: true };
  }

  async toggleCommentLike(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    const existing = await this.prisma.reaction.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (existing) {
      await this.prisma.$transaction([
        this.prisma.reaction.delete({ where: { id: existing.id } }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    }
    await this.prisma.$transaction([
      this.prisma.reaction.create({ data: { userId, commentId, type: 'COMMENT' } }),
      this.prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return { liked: true };
  }

  /** Mark a comment as the helpful answer. Only the post author or a moderator. */
  async markHelpful(commentId: string, userId: string, role: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
      include: { post: { select: { authorId: true, communityId: true } } },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    // The post author or a community moderator (not merely any platform role).
    if (comment.post.authorId !== userId) {
      await this.assertCanModerate(comment.post.communityId, userId, role);
    }
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { isHelpful: !comment.isHelpful },
    });
    // Reward when newly marked helpful; reverse it when unmarked, so repeated
    // toggling can't farm reputation for the comment author.
    if (updated.isHelpful) {
      await this.reputation.award(comment.authorId, 'HELPFUL_ANSWER', {
        refType: 'comment',
        refId: comment.id,
      });
    } else {
      await this.reputation.deduct(comment.authorId, 'HELPFUL_ANSWER', {
        refType: 'comment',
        refId: comment.id,
      });
    }
    return { isHelpful: updated.isHelpful };
  }
}
