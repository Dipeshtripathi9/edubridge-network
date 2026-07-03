import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportRequestDto } from './dto/support.dto';

@Injectable()
export class LeadershipService {
  constructor(private readonly prisma: PrismaService) {}

  /** A "manager" is anyone holding a non-MEMBER role in at least one community. */
  private async assertManager(userId: string) {
    const managerRoles = await this.prisma.communityMember.count({
      where: { userId, role: { not: 'MEMBER' } },
    });
    if (managerRoles === 0) {
      throw new ForbiddenException('Only community managers can contact the admin team');
    }
  }

  async createSupport(userId: string, dto: CreateSupportRequestDto) {
    await this.assertManager(userId);
    return this.prisma.managerSupportRequest.create({
      data: { userId, topic: dto.topic, message: dto.message },
    });
  }

  /** Admin inbox: open requests first, newest first, with who sent it and what they lead. */
  listSupport() {
    return this.prisma.managerSupportRequest.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 300,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                college: { select: { name: true } },
              },
            },
            communityMembers: {
              where: { role: { not: 'MEMBER' } },
              select: { role: true, community: { select: { name: true, slug: true } } },
            },
          },
        },
      },
    });
  }

  resolveSupport(id: string) {
    return this.prisma.managerSupportRequest.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });
  }
}
