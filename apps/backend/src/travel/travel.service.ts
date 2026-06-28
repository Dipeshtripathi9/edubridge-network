import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTravelPoolDto } from './dto/travel-pool.dto';

@Injectable()
export class TravelService {
  constructor(private readonly prisma: PrismaService) {}

  /** Only verified students can create or join pools. */
  private async assertVerified(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (profile?.collegeVerification !== 'VERIFIED') {
      throw new ForbiddenException('Verify your college to use GoTogether');
    }
  }

  private status(joined: number, seats: number, completed: boolean): string {
    if (completed) return 'COMPLETED';
    if (joined >= seats) return 'CONFIRMED';
    if (joined / Math.max(1, seats) >= 0.8) return 'ALMOST_FULL';
    return 'OPEN';
  }

  private shape(p: {
    id: string;
    kind: string;
    title: string;
    seats: number;
    completed: boolean;
    members: { userId: string }[];
    _count: { members: number };
    [k: string]: unknown;
  }, userId?: string) {
    const joined = p._count.members;
    const { members, _count, ...rest } = p;
    return {
      ...rest,
      joined,
      isMember: !!userId && members.some((m) => m.userId === userId),
      status: this.status(joined, p.seats, p.completed),
    };
  }

  async create(userId: string, dto: CreateTravelPoolDto) {
    await this.assertVerified(userId);
    const pool = await this.prisma.travelPool.create({
      data: { ...dto, createdById: userId, members: { create: { userId } } },
      include: { _count: { select: { members: true } }, members: { select: { userId: true } } },
    });
    return this.shape(pool, userId);
  }

  async list(kind: string | undefined, userId?: string) {
    const pools = await this.prisma.travelPool.findMany({
      where: { ...(kind ? { kind } : {}), completed: false },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { _count: { select: { members: true } }, members: { select: { userId: true } } },
    });
    return pools.map((p) => this.shape(p, userId));
  }

  async join(id: string, userId: string) {
    await this.assertVerified(userId);
    const pool = await this.prisma.travelPool.findUnique({
      where: { id },
      include: { _count: { select: { members: true } }, members: { select: { userId: true } } },
    });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.members.some((m) => m.userId === userId)) {
      return this.shape(pool, userId); // already joined — idempotent
    }
    if (pool._count.members >= pool.seats) throw new BadRequestException('This pool is full');
    await this.prisma.travelPoolMember.create({ data: { poolId: id, userId } });
    const updated = await this.prisma.travelPool.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { members: true } }, members: { select: { userId: true } } },
    });
    return this.shape(updated, userId);
  }
}
