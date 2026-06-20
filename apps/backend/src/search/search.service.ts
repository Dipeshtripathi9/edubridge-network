import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { SearchQueryDto, SEARCH_TYPES, SearchType } from './dto/search.dto';

export interface SearchHit {
  type: SearchType;
  id: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  url: string | null;
  tags?: string[];
}

const INDEX = 'edubridge_search';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly client: Client;
  private esOk = false;
  private lastProbe = 0;
  private static readonly PROBE_INTERVAL_MS = 30_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.client = new Client({
      node: this.config.get<string>('elasticsearch.node') ?? 'http://localhost:9200',
      requestTimeout: 2000,
    });
  }

  /**
   * Probe Elasticsearch, caching the result. When down, re-probe at most every
   * PROBE_INTERVAL_MS so a transient outage (or a later ES start) self-heals
   * without a restart; otherwise fall back to Postgres.
   */
  private async esEnabled(): Promise<boolean> {
    if (this.esOk) return true;
    const now = Date.now();
    if (now - this.lastProbe < SearchService.PROBE_INTERVAL_MS) return false;
    this.lastProbe = now;
    try {
      await this.client.ping();
      await this.ensureIndex();
      this.esOk = true;
      this.logger.log('Elasticsearch connected — search uses ES.');
    } catch {
      this.esOk = false;
      this.logger.warn('Elasticsearch unavailable — search uses Postgres fallback.');
    }
    return this.esOk;
  }

  private async ensureIndex() {
    const exists = await this.client.indices.exists({ index: INDEX });
    if (!exists) {
      await this.client.indices.create({
        index: INDEX,
        mappings: {
          properties: {
            entityType: { type: 'keyword' },
            entityId: { type: 'keyword' },
            title: { type: 'text' },
            subtitle: { type: 'text' },
            body: { type: 'text' },
            tags: { type: 'text' },
            url: { type: 'keyword', index: false },
          },
        },
      });
    }
  }

  // ---------------- Public search ----------------
  async search(query: SearchQueryDto) {
    const q = query.q.trim();
    if (query.type) {
      const { items, total } = await this.searchType(query.type, q, query.skip, query.limit);
      return { ...buildPaginatedResult(items, query, total) };
    }

    // "All" view: top results per type + counts.
    const perType = 5;
    const results = await Promise.all(
      SEARCH_TYPES.map(async (type) => {
        const { items, total } = await this.searchType(type, q, 0, perType);
        return { type, items, total };
      }),
    );
    const groups: Record<string, SearchHit[]> = {};
    const counts: Record<string, number> = {};
    for (const r of results) {
      groups[r.type] = r.items;
      counts[r.type] = r.total;
    }
    // Plain object → wrapped by the interceptor as { success, data: { groups, counts } }.
    return { groups, counts };
  }

  private async searchType(
    type: SearchType,
    q: string,
    skip: number,
    take: number,
  ): Promise<{ items: SearchHit[]; total: number }> {
    if (await this.esEnabled()) {
      try {
        return await this.searchTypeEs(type, q, skip, take);
      } catch (e) {
        this.logger.warn(`ES query failed (${type}), falling back: ${(e as Error).message}`);
      }
    }
    return this.searchTypePg(type, q, skip, take);
  }

  private async searchTypeEs(type: SearchType, q: string, from: number, size: number) {
    const res = await this.client.search<{ entityId: string; title: string; subtitle?: string; url?: string; tags?: string[] }>({
      index: INDEX,
      from,
      size,
      query: {
        bool: {
          must: [{ multi_match: { query: q, fields: ['title^3', 'subtitle^2', 'body', 'tags'], fuzziness: 'AUTO' } }],
          filter: [{ term: { entityType: type } }],
        },
      },
    });
    const total = typeof res.hits.total === 'number' ? res.hits.total : res.hits.total?.value ?? 0;
    const items: SearchHit[] = res.hits.hits.map((h) => ({
      type,
      id: h._source!.entityId,
      title: h._source!.title,
      subtitle: h._source!.subtitle ?? null,
      url: h._source!.url ?? null,
      tags: h._source!.tags,
    }));
    return { items, total };
  }

  // ---------------- Postgres fallback (per type) ----------------
  private async searchTypePg(
    type: SearchType,
    q: string,
    skip: number,
    take: number,
  ): Promise<{ items: SearchHit[]; total: number }> {
    const like = { contains: q, mode: 'insensitive' as const };

    switch (type) {
      case 'college': {
        const where = { name: like };
        const [rows, total] = await Promise.all([
          this.prisma.college.findMany({ where, skip, take, orderBy: { reviewCount: 'desc' } }),
          this.prisma.college.count({ where }),
        ]);
        return {
          total,
          items: rows.map((c) => ({
            type,
            id: c.id,
            title: c.name,
            subtitle: [c.city, c.state].filter(Boolean).join(', ') || null,
            url: `/reviews/${c.slug}`,
          })),
        };
      }
      case 'community': {
        const where = { OR: [{ name: like }, { topic: like }] };
        const [rows, total] = await Promise.all([
          this.prisma.community.findMany({ where, skip, take, orderBy: { memberCount: 'desc' } }),
          this.prisma.community.count({ where }),
        ]);
        return {
          total,
          items: rows.map((c) => ({
            type,
            id: c.id,
            title: c.name,
            subtitle: c.type === 'COLLEGE' ? 'College community' : c.topic,
            url: `/communities/${c.slug}`,
          })),
        };
      }
      case 'user': {
        const where = { OR: [{ fullName: like }, { username: like }] };
        const [rows, total] = await Promise.all([
          this.prisma.profile.findMany({
            where,
            skip,
            take,
            include: { college: { select: { name: true } } },
          }),
          this.prisma.profile.count({ where }),
        ]);
        return {
          total,
          items: rows.map((p) => ({
            type,
            id: p.userId,
            title: p.fullName,
            subtitle: p.college?.name ?? p.username ?? null,
            url: null,
          })),
        };
      }
      case 'opportunity': {
        const where = { isActive: true, OR: [{ title: like }, { organization: like }] };
        const [rows, total] = await Promise.all([
          this.prisma.opportunity.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
          this.prisma.opportunity.count({ where }),
        ]);
        return {
          total,
          items: rows.map((o) => ({
            type,
            id: o.id,
            title: o.title,
            subtitle: o.organization,
            url: `/opportunities`,
            tags: o.tags,
          })),
        };
      }
      case 'resource': {
        const where = { deletedAt: null, title: like };
        const [rows, total] = await Promise.all([
          this.prisma.resource.findMany({ where, skip, take, orderBy: { downloadCount: 'desc' } }),
          this.prisma.resource.count({ where }),
        ]);
        return {
          total,
          items: rows.map((r) => ({
            type,
            id: r.id,
            title: r.title,
            subtitle: r.type,
            url: `/resources`,
            tags: r.tags,
          })),
        };
      }
      case 'review': {
        const where = { deletedAt: null, OR: [{ title: like }, { body: like }] };
        const [rows, total] = await Promise.all([
          this.prisma.review.findMany({
            where,
            skip,
            take,
            orderBy: { upvotes: 'desc' },
            include: { college: { select: { name: true, slug: true } } },
          }),
          this.prisma.review.count({ where }),
        ]);
        return {
          total,
          items: rows.map((r) => ({
            type,
            id: r.id,
            title: r.title ?? `${r.category} review`,
            subtitle: r.college?.name ?? null,
            body: r.body.slice(0, 140),
            url: `/reviews/${r.college?.slug ?? ''}`,
          })),
        };
      }
    }
  }

  // ---------------- Reindex (admin) ----------------
  async reindexAll() {
    if (!(await this.esEnabled())) {
      return { indexed: 0, message: 'Elasticsearch not available; search is using the Postgres fallback.' };
    }
    await this.client.indices.delete({ index: INDEX }).catch(() => undefined);
    await this.ensureIndex();

    const docs: Array<SearchHit & { entityType: SearchType; entityId: string }> = [];
    const push = (h: SearchHit) => docs.push({ ...h, entityType: h.type, entityId: h.id });

    const [colleges, communities, profiles, opportunities, resources, reviews] = await Promise.all([
      this.prisma.college.findMany(),
      this.prisma.community.findMany(),
      this.prisma.profile.findMany({ include: { college: { select: { name: true } } } }),
      this.prisma.opportunity.findMany({ where: { isActive: true } }),
      this.prisma.resource.findMany({ where: { deletedAt: null } }),
      this.prisma.review.findMany({ where: { deletedAt: null }, include: { college: { select: { name: true, slug: true } } } }),
    ]);

    colleges.forEach((c) =>
      push({ type: 'college', id: c.id, title: c.name, subtitle: [c.city, c.state].filter(Boolean).join(', '), url: `/reviews/${c.slug}` }),
    );
    communities.forEach((c) =>
      push({ type: 'community', id: c.id, title: c.name, subtitle: c.topic ?? 'College community', body: c.description, url: `/communities/${c.slug}` }),
    );
    profiles.forEach((p) =>
      push({ type: 'user', id: p.userId, title: p.fullName, subtitle: p.college?.name ?? p.username, url: null }),
    );
    opportunities.forEach((o) =>
      push({ type: 'opportunity', id: o.id, title: o.title, subtitle: o.organization, body: o.description, tags: o.tags, url: `/opportunities` }),
    );
    resources.forEach((r) =>
      push({ type: 'resource', id: r.id, title: r.title, subtitle: r.type, body: r.description, tags: r.tags, url: `/resources` }),
    );
    reviews.forEach((r) =>
      push({ type: 'review', id: r.id, title: r.title ?? `${r.category} review`, subtitle: r.college?.name, body: r.body, url: `/reviews/${r.college?.slug ?? ''}` }),
    );

    const operations = docs.flatMap((d) => [{ index: { _index: INDEX } }, d]);
    if (operations.length) await this.client.bulk({ operations, refresh: true });
    return { indexed: docs.length };
  }
}
