import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Any authenticated user (typically a community manager) raises an issue to admins. */
  submit(userId: string, body: string, communityId?: string) {
    return this.prisma.complaint.create({
      data: { userId, body, communityId: communityId ?? null },
    });
  }

  /** Admin queue. */
  async list(query: PaginationDto) {
    const items = await this.prisma.complaint.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], // OPEN before RESOLVED
      skip: query.skip,
      take: query.limit,
      include: {
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        community: { select: { id: true, name: true, slug: true } },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async resolve(adminId: string, id: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    await this.prisma.complaint.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedById: adminId, resolvedAt: new Date() },
    });
    return { id, status: 'RESOLVED' };
  }
}
