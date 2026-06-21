import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  list(collegeId: string) {
    return this.prisma.collegeFaq.findMany({
      where: { collegeId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(collegeId: string, createdById: string, dto: CreateFaqDto) {
    const college = await this.prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) throw new NotFoundException('College not found');
    return this.prisma.collegeFaq.create({
      data: {
        collegeId,
        createdById,
        question: dto.question,
        answer: dto.answer,
        order: dto.order ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateFaqDto) {
    const faq = await this.prisma.collegeFaq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return this.prisma.collegeFaq.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const faq = await this.prisma.collegeFaq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    await this.prisma.collegeFaq.delete({ where: { id } });
    return { deleted: true };
  }
}
