import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { CampusAmbassadorApplicationQueryDto } from './dto/campus-ambassador.dto';

// Whether new applications are accepted is a plain boolean flag in the
// generic `Setting` key-value table — no dedicated settings model needed
// for one flag.
const APPLICATIONS_OPEN_KEY = 'campus_ambassador_applications_open';

@Injectable()
export class CampusAmbassadorService {
  constructor(private readonly prisma: PrismaService) {}

  async isOpen(): Promise<boolean> {
    const row = await this.prisma.setting.findUnique({ where: { key: APPLICATIONS_OPEN_KEY } });
    // Defaults to open until an admin explicitly closes it.
    return row ? row.value === 'true' : true;
  }

  async setOpen(applicationsOpen: boolean) {
    await this.prisma.setting.upsert({
      where: { key: APPLICATIONS_OPEN_KEY },
      update: { value: String(applicationsOpen) },
      create: { key: APPLICATIONS_OPEN_KEY, value: String(applicationsOpen) },
    });
    return { applicationsOpen };
  }

  async apply(userId: string, reason: string) {
    if (!(await this.isOpen())) {
      throw new ForbiddenException('Campus ambassador applications are currently closed');
    }
    const existing = await this.prisma.campusAmbassadorApplication.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('You have already applied');

    return this.prisma.campusAmbassadorApplication.create({ data: { userId, reason } });
  }

  async myApplication(userId: string) {
    return this.prisma.campusAmbassadorApplication.findUnique({ where: { userId } });
  }

  async listApplications(query: CampusAmbassadorApplicationQueryDto) {
    const where = query.status ? { status: query.status } : {};
    const items = await this.prisma.campusAmbassadorApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: { select: { fullName: true, state: true } },
          },
        },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async decide(applicationId: string, approve: boolean) {
    const application = await this.prisma.campusAmbassadorApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    return this.prisma.campusAmbassadorApplication.update({
      where: { id: applicationId },
      data: { status: approve ? 'APPROVED' : 'REJECTED', decidedAt: new Date() },
    });
  }

  /** Everyone whose application is approved — contact no, gmail, state. */
  async listAmbassadors() {
    const approved = await this.prisma.campusAmbassadorApplication.findMany({
      where: { status: 'APPROVED' },
      orderBy: { decidedAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, phone: true, profile: { select: { fullName: true, state: true } } },
        },
      },
    });
    return approved.map((a) => ({
      userId: a.userId,
      email: a.user.email,
      phone: a.user.phone,
      fullName: a.user.profile?.fullName ?? null,
      state: a.user.profile?.state ?? null,
      approvedAt: a.decidedAt,
    }));
  }

  /** How many new accounts each approved ambassador's referral code has brought in. */
  async referralCounts() {
    const approved = await this.prisma.campusAmbassadorApplication.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
            referralCode: { select: { code: true } },
            _count: { select: { referrals: true } },
          },
        },
      },
    });
    return approved
      .map((a) => ({
        userId: a.userId,
        email: a.user.email,
        fullName: a.user.profile?.fullName ?? null,
        referralCode: a.user.referralCode?.code ?? null,
        referralCount: a.user._count.referrals,
      }))
      .sort((x, y) => y.referralCount - x.referralCount);
  }
}
