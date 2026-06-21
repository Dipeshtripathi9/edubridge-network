-- AlterTable
ALTER TABLE "community_members" ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "mutedUntil" TIMESTAMP(3);
