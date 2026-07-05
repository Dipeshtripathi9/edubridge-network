import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { EligibilityCheckDto } from './dto/eligibility.dto';
import {
  CreateTransferDto,
  ShareStoryDto,
  TransferStoryQueryDto,
  UpdateTransferDto,
  UpsertRequirementDto,
} from './dto/transfer.dto';

@Injectable()
export class TransferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Eligibility engine: given a student's CGPA, year and branch, return colleges
   * whose transfer requirements they satisfy, with deadlines, fees and credit-transfer
   * compatibility. Backed by the College Data layer (TransferRequirement).
   */
  async checkEligibility(dto: EligibilityCheckDto) {
    const cacheKey = `transfer:eligibility:${JSON.stringify(dto)}`;
    return this.redis.remember(cacheKey, 60, async () => {
      const where: Prisma.TransferRequirementWhereInput = {
        AND: [
          { OR: [{ branch: null }, { branch: { equals: dto.branch, mode: 'insensitive' } }] },
          { OR: [{ minCgpa: null }, { minCgpa: { lte: dto.cgpa } }] },
          { OR: [{ minYear: null }, { minYear: { lte: dto.currentYear } }] },
          { OR: [{ maxYear: null }, { maxYear: { gte: dto.currentYear } }] },
          ...(dto.creditTransferOnly ? [{ creditTransfer: true }] : []),
          ...(dto.currentCollegeId ? [{ collegeId: { not: dto.currentCollegeId } }] : []),
        ],
      };

      const requirements = await this.prisma.transferRequirement.findMany({
        where,
        include: {
          college: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              state: true,
              nirfRank: true,
              avgRating: true,
              avgPlacementPackage: true,
              logoUrl: true,
            },
          },
        },
      });

      // Rank: better NIRF rank first, then higher rating.
      const matches = requirements
        .map((r) => {
          const cgpaHeadroom = r.minCgpa != null ? dto.cgpa - r.minCgpa : null;
          return {
            college: r.college,
            requirement: {
              id: r.id,
              branch: r.branch,
              minCgpa: r.minCgpa,
              minYear: r.minYear,
              maxYear: r.maxYear,
              creditTransfer: r.creditTransfer,
              deadline: r.deadline,
              feeAmount: r.feeAmount,
              notes: r.notes,
            },
            cgpaHeadroom,
          };
        })
        .sort((a, b) => {
          const ra = a.college.nirfRank ?? 9999;
          const rb = b.college.nirfRank ?? 9999;
          if (ra !== rb) return ra - rb;
          return (b.college.avgRating ?? 0) - (a.college.avgRating ?? 0);
        });

      return {
        eligibleCount: matches.length,
        input: dto,
        matches,
      };
    });
  }

  /** Requirements for a single college (for the detail view). */
  async getCollegeRequirements(collegeId: string) {
    const college = await this.prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, name: true, slug: true },
    });
    if (!college) throw new NotFoundException('College not found');
    const requirements = await this.prisma.transferRequirement.findMany({
      where: { collegeId },
      orderBy: { branch: 'asc' },
    });
    return { college, requirements };
  }

  // ---------------- Transfer journey ----------------
  async createOrUpdateJourney(userId: string, dto: CreateTransferDto) {
    // One journey per destination — update the existing one instead of stacking
    // duplicates every time the form is submitted.
    if (dto.toCollegeId) {
      const existing = await this.prisma.transfer.findFirst({
        where: { userId, toCollegeId: dto.toCollegeId },
      });
      if (existing) {
        return this.prisma.transfer.update({
          where: { id: existing.id },
          data: { ...dto },
          include: { fromCollege: true, toCollege: true },
        });
      }
    }
    return this.prisma.transfer.create({
      data: { userId, ...dto, status: 'EXPLORING' },
      include: { fromCollege: true, toCollege: true },
    });
  }

  async getMyJourneys(userId: string) {
    return this.prisma.transfer.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        fromCollege: { select: { id: true, name: true } },
        toCollege: { select: { id: true, name: true, city: true, state: true } },
      },
    });
  }

  async updateJourney(userId: string, id: string, dto: UpdateTransferDto) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (transfer.userId !== userId) throw new ForbiddenException('Not your transfer');
    return this.prisma.transfer.update({
      where: { id },
      data: dto,
      include: { fromCollege: true, toCollege: true },
    });
  }

  async deleteJourney(userId: string, id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (transfer.userId !== userId) throw new ForbiddenException('Not your transfer');
    await this.prisma.transfer.delete({ where: { id } });
    return { deleted: true };
  }

  // ---------------- Transfer stories ----------------
  async shareStory(userId: string, id: string, dto: ShareStoryDto) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (transfer.userId !== userId) throw new ForbiddenException('Not your transfer');
    return this.prisma.transfer.update({
      where: { id },
      data: { story: dto.story, isStoryPublic: dto.isStoryPublic ?? true },
    });
  }

  async listStories(query: TransferStoryQueryDto) {
    const where: Prisma.TransferWhereInput = {
      isStoryPublic: true,
      story: { not: null },
      ...(query.toCollegeId ? { toCollegeId: query.toCollegeId } : {}),
    };
    const stories = await this.prisma.transfer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        fromCollege: { select: { id: true, name: true } },
        toCollege: { select: { id: true, name: true } },
        user: {
          select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } },
        },
      },
    });
    return buildPaginatedResult(stories, query);
  }

  async getStory(id: string) {
    const story = await this.prisma.transfer.findFirst({
      where: { id, isStoryPublic: true },
      include: {
        fromCollege: true,
        toCollege: true,
        user: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
      },
    });
    if (!story) throw new NotFoundException('Story not found');
    return story;
  }

  // ---------------- Admin: requirements management ----------------
  async upsertRequirement(dto: UpsertRequirementDto) {
    const college = await this.prisma.college.findUnique({ where: { id: dto.collegeId } });
    if (!college) throw new NotFoundException('College not found');

    const data = {
      collegeId: dto.collegeId,
      branch: dto.branch,
      minCgpa: dto.minCgpa,
      minYear: dto.minYear,
      maxYear: dto.maxYear,
      creditTransfer: dto.creditTransfer ?? false,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      feeAmount: dto.feeAmount,
      notes: dto.notes,
      sourceSystem: 'manual',
    };

    const result = await this.prisma.transferRequirement.create({ data });
    await this.redis.delPattern('transfer:eligibility:*');
    return result;
  }
}
