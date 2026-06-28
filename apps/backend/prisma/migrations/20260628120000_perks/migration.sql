-- Perk 2: discount claims (45% off web dev at 600+ members)
CREATE TABLE "discount_claims" (
  "id" TEXT NOT NULL,
  "communityId" TEXT NOT NULL,
  "claimedById" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "discount_claims_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "discount_claims_communityId_key" ON "discount_claims"("communityId");
ALTER TABLE "discount_claims" ADD CONSTRAINT "discount_claims_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discount_claims" ADD CONSTRAINT "discount_claims_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Perk 3: career referrals for leaders
CREATE TABLE "referrals" (
  "id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "description" TEXT,
  "link" TEXT,
  "postedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "referrals_createdAt_idx" ON "referrals"("createdAt" DESC);
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
