-- AlterEnum
ALTER TYPE "PostKind" ADD VALUE 'ANNOUNCEMENT';

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN     "approvalStatus" "VerificationRequestStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "communityId" TEXT;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "communityId" TEXT;

-- CreateIndex
CREATE INDEX "opportunities_communityId_approvalStatus_idx" ON "opportunities"("communityId", "approvalStatus");

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
