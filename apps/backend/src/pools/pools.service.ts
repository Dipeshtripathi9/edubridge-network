import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoolDto } from './dto/pool.dto';
import { isPlatformAdmin } from '../communities/community-permissions';

@Injectable()
export class PoolsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCommunityMember(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!member) throw new ForbiddenException('Join the community first');
  }

  /** Create a private capped group ("pool") backed by a GROUP chat. */
  async create(userId: string, slug: string, dto: CreatePoolDto) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    await this.assertCommunityMember(community.id, userId);

    const pool = await this.prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          type: 'GROUP',
          communityId: community.id,
          title: dto.title,
          participants: { create: { userId } },
        },
      });
      return tx.pool.create({
        data: {
          communityId: community.id,
          title: dto.title,
          description: dto.description,
          maxMembers: dto.maxMembers,
          createdById: userId,
          chatId: chat.id,
          members: { create: { userId } },
        },
      });
    });
    return { ...pool, memberCount: 1, isMember: true };
  }

  /**
   * Suggest existing pools in this community that loosely match a title/topic, so a
   * user about to create a pool can join a similar one instead of duplicating it.
   * Matches the whole phrase or any 3+ char word; open pools first.
   */
  async searchSimilar(slug: string, q: string, userId: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const term = (q ?? '').trim();
    if (term.length < 2) return [];

    const words = Array.from(new Set(term.split(/\s+/).filter((w) => w.length >= 3)));
    const contains = [term, ...words].map((w) => ({
      title: { contains: w, mode: 'insensitive' as const },
    }));

    const pools = await this.prisma.pool.findMany({
      where: { communityId: community.id, OR: contains },
      take: 20,
      include: {
        _count: { select: { members: true } },
        members: { where: { userId }, select: { id: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    });
    return pools
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        maxMembers: p.maxMembers,
        chatId: p.chatId,
        createdById: p.createdById,
        memberCount: p._count.members,
        isMember: p.members.length > 0,
        isFull: p._count.members >= p.maxMembers,
        likeCount: p.likeCount,
        shareCount: p.shareCount,
        likedByMe: p.likes.length > 0,
        createdAt: p.createdAt,
      }))
      .sort((a, b) => PoolsService.poolRank(a, b))
      .slice(0, 5);
  }

  async list(slug: string, userId: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const pools = await this.prisma.pool.findMany({
      where: { communityId: community.id },
      include: {
        _count: { select: { members: true } },
        members: { where: { userId }, select: { id: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    });
    return pools
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        maxMembers: p.maxMembers,
        chatId: p.chatId,
        createdById: p.createdById,
        memberCount: p._count.members,
        isMember: p.members.length > 0,
        isFull: p._count.members >= p.maxMembers,
        likeCount: p.likeCount,
        shareCount: p.shareCount,
        likedByMe: p.likes.length > 0,
        createdAt: p.createdAt,
      }))
      .sort((a, b) => PoolsService.poolRank(a, b));
  }

  /**
   * How "trending" a pool is — its interest level. Driven by engagement
   * (members, likes, shares) with a small freshness bonus so brand-new pools
   * people are asking for get a chance, fading over ~3 days. Low-interest pools
   * (nobody joining/liking) score near zero and sink.
   */
  private static trendScore(p: {
    memberCount: number;
    likeCount: number;
    shareCount: number;
    createdAt: Date;
  }): number {
    const ageDays = (Date.now() - p.createdAt.getTime()) / 86_400_000;
    const freshness = Math.max(0, 3 - ageDays); // up to +3 for new, gone after 3 days
    return p.memberCount * 3 + p.likeCount * 2 + p.shareCount + freshness;
  }

  /**
   * Ranking for a community's pools: trending pools that still have space rise to
   * the top; completely-full pools (and low-interest ones nobody is joining) sink
   * to the bottom.
   */
  private static poolRank(
    a: { isFull: boolean; memberCount: number; likeCount: number; shareCount: number; createdAt: Date },
    b: { isFull: boolean; memberCount: number; likeCount: number; shareCount: number; createdAt: Date },
  ): number {
    if (a.isFull !== b.isFull) return a.isFull ? 1 : -1; // full → bottom
    const s = PoolsService.trendScore(b) - PoolsService.trendScore(a); // more trending → top
    if (s !== 0) return s;
    return b.createdAt.getTime() - a.createdAt.getTime();
  }

  /** Pools the user belongs to, across all communities (their "network"). */
  async myPools(userId: string) {
    const memberships = await this.prisma.poolMember.findMany({
      where: { userId },
      orderBy: { joinedAt: 'desc' },
      include: {
        pool: {
          include: {
            community: { select: { name: true, slug: true } },
            _count: { select: { members: true } },
            likes: { where: { userId }, select: { id: true } },
          },
        },
      },
    });
    return memberships.map((m) => ({
      id: m.pool.id,
      title: m.pool.title,
      description: m.pool.description,
      maxMembers: m.pool.maxMembers,
      chatId: m.pool.chatId,
      createdById: m.pool.createdById,
      memberCount: m.pool._count.members,
      isFull: m.pool._count.members >= m.pool.maxMembers,
      isMember: true,
      likeCount: m.pool.likeCount,
      shareCount: m.pool.shareCount,
      likedByMe: m.pool.likes.length > 0,
      community: m.pool.community,
    }));
  }

  async get(id: string, userId: string) {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, profile: { select: { fullName: true } } } } },
        },
        likes: { where: { userId }, select: { id: true } },
        community: { select: { name: true, slug: true } },
      },
    });
    if (!pool) throw new NotFoundException('Pool not found');
    const isMember = pool.members.some((m) => m.userId === userId);
    return {
      id: pool.id,
      title: pool.title,
      description: pool.description,
      maxMembers: pool.maxMembers,
      chatId: pool.chatId,
      createdById: pool.createdById,
      memberCount: pool._count.members,
      isFull: pool._count.members >= pool.maxMembers,
      isMember,
      likeCount: pool.likeCount,
      shareCount: pool.shareCount,
      likedByMe: pool.likes.length > 0,
      community: pool.community,
      // The chat itself is only readable by members (chat participation guard).
      members: pool.members.map((m) => ({
        id: m.user.id,
        fullName: m.user.profile?.fullName ?? 'Student',
      })),
    };
  }

  async toggleLike(id: string, userId: string) {
    const existing = await this.prisma.poolLike.findUnique({
      where: { poolId_userId: { poolId: id, userId } },
    });
    if (existing) {
      await this.prisma.$transaction([
        this.prisma.poolLike.delete({ where: { id: existing.id } }),
        this.prisma.pool.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
      ]);
      return { liked: false };
    }
    await this.prisma.$transaction([
      this.prisma.poolLike.create({ data: { poolId: id, userId } }),
      this.prisma.pool.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
    ]);
    return { liked: true };
  }

  async share(id: string) {
    try {
      return await this.prisma.pool.update({
        where: { id },
        data: { shareCount: { increment: 1 } },
        select: { shareCount: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Pool not found');
      }
      throw err;
    }
  }

  async join(id: string, userId: string) {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });
    if (!pool) throw new NotFoundException('Pool not found');
    await this.assertCommunityMember(pool.communityId, userId);

    const existing = await this.prisma.poolMember.findUnique({
      where: { poolId_userId: { poolId: id, userId } },
    });
    if (existing) return { joined: true };

    // Capacity must be checked and enforced atomically — a plain count-then-create
    // lets concurrent joins both pass the check and overflow maxMembers. Serializable
    // isolation makes the re-count + insert conflict-safe; a write conflict (P2034)
    // means another join raced us, which we surface as "full, try again".
    try {
      await this.prisma.$transaction(
        async (tx) => {
          const count = await tx.poolMember.count({ where: { poolId: id } });
          if (count >= pool.maxMembers) throw new BadRequestException('This pool is full');
          await tx.poolMember.create({ data: { poolId: id, userId } });
          await tx.chatParticipant.upsert({
            where: { chatId_userId: { chatId: pool.chatId, userId } },
            update: {},
            create: { chatId: pool.chatId, userId },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
        throw new BadRequestException('This pool just filled up — please try again');
      }
      throw err;
    }
    return { joined: true };
  }

  async leave(id: string, userId: string) {
    const pool = await this.prisma.pool.findUnique({ where: { id } });
    if (!pool) throw new NotFoundException('Pool not found');
    await this.prisma.poolMember.deleteMany({ where: { poolId: id, userId } });
    await this.prisma.chatParticipant.deleteMany({ where: { chatId: pool.chatId, userId } });
    return { left: true };
  }

  /** Delete a pool entirely — platform admins can delete any pool; the creator
   *  can delete their own. Deleting the chat cascades to the pool, its members,
   *  likes, messages and chat participants. */
  async deletePool(id: string, userId: string, role: string) {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      select: { chatId: true, createdById: true },
    });
    if (!pool) throw new NotFoundException('Pool not found');
    if (!isPlatformAdmin(role) && pool.createdById !== userId) {
      throw new ForbiddenException('Only an admin or the pool creator can delete this pool');
    }
    await this.prisma.chat.delete({ where: { id: pool.chatId } });
    return { deleted: true };
  }
}
