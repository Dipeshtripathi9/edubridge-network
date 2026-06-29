import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMentorRequestDto } from './dto/mentor-request.dto';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMentorRequestDto) {
    return this.prisma.mentorRequest.create({ data: { ...dto } });
  }

  list() {
    return this.prisma.mentorRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  }
}
