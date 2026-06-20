import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(
    actorId: string,
    action: string,
    opts: { entity?: string; entityId?: string; metadata?: Prisma.InputJsonValue; ip?: string } = {},
  ) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity: opts.entity,
        entityId: opts.entityId,
        metadata: opts.metadata,
        ipAddress: opts.ip,
      },
    });
  }
}
