import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalLeadDto } from './dto/rental-lead.dto';

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRentalLeadDto) {
    return this.prisma.rentalLead.create({ data: { ...dto } });
  }

  list(kind?: string) {
    return this.prisma.rentalLead.findMany({
      where: kind ? { kind } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
