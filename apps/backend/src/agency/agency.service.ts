import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgencyLeadDto } from './dto/agency-lead.dto';

@Injectable()
export class AgencyService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAgencyLeadDto) {
    return this.prisma.agencyLead.create({
      data: {
        kind: dto.kind,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        services: dto.services ?? [],
        message: dto.message,
        role: dto.role,
        projectUrl: dto.projectUrl,
        videoUrls: dto.videoUrls ?? [],
      },
    });
  }

  list(kind?: string) {
    return this.prisma.agencyLead.findMany({
      where: kind ? { kind } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
