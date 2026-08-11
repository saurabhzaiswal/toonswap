import { BadRequestException, Injectable } from '@nestjs/common';
import { CatalogStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class VoiceCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(languageCode?: string, status?: string, limit = 24, offset = 0) {
    const catalogStatus = this.catalogStatus(status);
    const take = Math.min(100, Math.max(1, Number(limit) || 24));
    const skip = Math.max(0, Number(offset) || 0);
    const where = { ...(languageCode ? { languageCode } : {}), ...(catalogStatus ? { status: catalogStatus } : {}) };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.voiceProfile.findMany({ where, take, skip, orderBy: [{ status: 'asc' }, { languageName: 'asc' }, { name: 'asc' }] }),
      this.prisma.voiceProfile.count({ where }),
    ]);
    return { items, total, limit: take, offset: skip };
  }

  private catalogStatus(status?: string): CatalogStatus | undefined {
    if (!status) return undefined;
    const candidate = status.toUpperCase() as CatalogStatus;
    if (!Object.values(CatalogStatus).includes(candidate)) throw new BadRequestException('invalid catalog status');
    return candidate;
  }
}
