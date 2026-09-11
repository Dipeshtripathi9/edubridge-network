/* eslint-disable no-console */
// Standalone, idempotent backfill for referral_codes — assigns an
// "EBN0001"-style code to every existing user who doesn't have one yet,
// oldest account first, so registration order is preserved in the sequence.
// Safe to re-run: already-coded users are skipped. Not wired into any
// feature yet.
// Usage: DATABASE_URL="..." npx ts-node prisma/backfill-referral-codes.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function formatReferralCode(sequence: number): string {
  return `EBN${String(sequence).padStart(4, '0')}`;
}

async function main() {
  const pending = await prisma.user.findMany({
    where: { referralCode: null },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  let assigned = 0;
  for (const { id } of pending) {
    const created = await prisma.referralCode.create({ data: { userId: id } });
    await prisma.referralCode.update({
      where: { id: created.id },
      data: { code: formatReferralCode(created.sequence) },
    });
    assigned += 1;
  }
  console.log(`✓ assigned ${assigned} referral code${assigned === 1 ? '' : 's'}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
