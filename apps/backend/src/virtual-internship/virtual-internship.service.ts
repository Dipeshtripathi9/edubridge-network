import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VirtualInternshipService {
  constructor(private readonly prisma: PrismaService) {}

  listEnrollments() {
    return this.prisma.virtualInternshipEnrollment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, phone: true, profile: { select: { fullName: true } } } },
        tasks: { orderBy: { taskIndex: 'asc' } },
      },
    });
  }

  listScholarships() {
    return this.prisma.virtualInternshipScholarship.findMany({ orderBy: { track: 'asc' } });
  }
}
