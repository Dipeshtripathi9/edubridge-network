-- Advertisement cards booked by community heads/admins.
CREATE TABLE "ad_cards" (
  "id" TEXT NOT NULL,
  "communityId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "imageUrl" TEXT,
  "linkUrl" TEXT,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ad_cards_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ad_cards_communityId_scheduledFor_idx" ON "ad_cards"("communityId", "scheduledFor");
CREATE INDEX "ad_cards_createdById_scheduledFor_idx" ON "ad_cards"("createdById", "scheduledFor");
ALTER TABLE "ad_cards" ADD CONSTRAINT "ad_cards_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_cards" ADD CONSTRAINT "ad_cards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
