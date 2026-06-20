import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../src/auth/services/token.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TokenService (unit)', () => {
  let service: TokenService;

  beforeAll(() => {
    // Prisma + Config are not exercised by the password/token helpers under test.
    service = new TokenService(
      new JwtService({}),
      { get: () => undefined } as unknown as ConfigService,
      {} as unknown as PrismaService,
    );
  });

  it('hashes and verifies a password (argon2id)', async () => {
    const hash = await service.hashPassword('Str0ngPass');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await service.verifyPassword(hash, 'Str0ngPass')).toBe(true);
    expect(await service.verifyPassword(hash, 'wrong')).toBe(false);
  });

  it('produces deterministic token hashes', () => {
    const a = service.hashToken('abc');
    const b = service.hashToken('abc');
    expect(a).toBe(b);
    expect(a).toHaveLength(64); // sha256 hex
  });

  it('generates unique opaque tokens', () => {
    expect(service.generateOpaqueToken()).not.toBe(service.generateOpaqueToken());
  });
});
