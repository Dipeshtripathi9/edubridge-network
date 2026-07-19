import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Any authenticated user raises an issue directly to admins. */
  async submit(userId: string, body: string) {
    return this.prisma.complaint.create({
      data: { userId, body },
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
      },
    });
    return buildPaginatedResult(items, query);
  }

  async resolve(adminId: string, id: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    // Don't overwrite the original resolver/timestamp on a re-resolve.
    if (complaint.status === 'RESOLVED') return { id, status: 'RESOLVED' };
    await this.prisma.complaint.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedById: adminId, resolvedAt: new Date() },
    });
    return { id, status: 'RESOLVED' };
  }
}
