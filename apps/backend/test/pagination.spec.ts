import { buildPaginatedResult, PaginationDto } from '../src/common/dto/pagination.dto';

describe('PaginationDto', () => {
  it('defaults to page 1, limit 20, skip 0', () => {
    const dto = new PaginationDto();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    expect(dto.skip).toBe(0);
  });

  it('computes skip from page and limit', () => {
    const dto = new PaginationDto();
    dto.page = 3;
    dto.limit = 15;
    expect(dto.skip).toBe(30);
  });
});

describe('buildPaginatedResult', () => {
  const dto = (page: number, limit: number) => {
    const d = new PaginationDto();
    d.page = page;
    d.limit = limit;
    return d;
  };
  const items = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `id-${i}` }));

  it('flags hasMore + nextCursor when a full page is returned', () => {
    const res = buildPaginatedResult(items(10), dto(1, 10), 25);
    expect(res.meta.hasMore).toBe(true);
    expect(res.meta.nextCursor).toBe('id-9');
    expect(res.meta.total).toBe(25);
    expect(res.meta.page).toBe(1);
  });

  it('marks the last page (partial) as hasMore=false with null cursor', () => {
    const res = buildPaginatedResult(items(4), dto(2, 10));
    expect(res.meta.hasMore).toBe(false);
    expect(res.meta.nextCursor).toBeNull();
  });

  it('handles an empty result set', () => {
    const res = buildPaginatedResult([], dto(1, 10));
    expect(res.data).toEqual([]);
    expect(res.meta.hasMore).toBe(false);
    expect(res.meta.nextCursor).toBeNull();
  });
});
