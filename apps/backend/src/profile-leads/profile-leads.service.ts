import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DeleteProfileLeadDto,
  ProfileLeadNoteDto,
  UpsertProfileStepDto,
} from './dto/profile-lead.dto';

@Injectable()
export class ProfileLeadsService {
  constructor(private readonly prisma: PrismaService) {}

  // Upsert the current student's lead with one step's data. Steps map to the
  // step1..step5 JSON columns; completionPct only ever moves forward.
  async upsertStep(userId: string, dto: UpsertProfileStepDto) {
    const stepData = dto.data as Prisma.InputJsonValue;
    const stepField = `step${dto.step}` as 'step1' | 'step2' | 'step3' | 'step4' | 'step5';
    const contact = {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.phone ? { phone: dto.phone } : {}),
      ...(dto.email ? { email: dto.email } : {}),
    };

    const existing = await this.prisma.profileLead.findUnique({ where: { userId } });
    const pct = Math.max(existing?.completionPct ?? 0, dto.completionPct);

    return this.prisma.profileLead.upsert({
      where: { userId },
      create: { userId, [stepField]: stepData, completionPct: pct, ...contact },
      update: { [stepField]: stepData, completionPct: pct, ...contact },
    });
  }

  myLead(userId: string) {
    return this.prisma.profileLead.findUnique({ where: { userId } });
  }

  list() {
    return this.prisma.profileLead.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 300,
      include: {
        user: {
          select: { profile: { select: { avatarUrl: true, collegeVerification: true } } },
        },
      },
    });
  }

  async setNote(id: string, dto: ProfileLeadNoteDto) {
    const lead = await this.prisma.profileLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Profile lead not found');
    return this.prisma.profileLead.update({ where: { id }, data: { adminNote: dto.note } });
  }

  // Delete a lead: log the reason + a snapshot, then remove it so it disappears
  // from every view and the student can fill a fresh form.
  async remove(id: string, adminId: string, dto: DeleteProfileLeadDto) {
    if (!dto.reason?.trim()) throw new ForbiddenException('A reason is required to delete a profile.');
    const lead = await this.prisma.profileLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Profile lead not found');

    await this.prisma.$transaction([
      this.prisma.profileLeadDeletion.create({
        data: {
          userId: lead.userId,
          name: lead.name,
          reason: dto.reason.trim(),
          snapshot: {
            step1: lead.step1 ?? undefined,
            step2: lead.step2 ?? undefined,
            step3: lead.step3 ?? undefined,
            step4: lead.step4 ?? undefined,
            step5: lead.step5 ?? undefined,
            completionPct: lead.completionPct,
            adminNote: lead.adminNote,
          } as Prisma.InputJsonValue,
          deletedBy: adminId,
        },
      }),
      this.prisma.profileLead.delete({ where: { id } }),
    ]);
    return { ok: true };
  }
}
