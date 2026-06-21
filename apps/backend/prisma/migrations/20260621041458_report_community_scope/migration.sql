-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "communityId" TEXT;

-- CreateIndex
CREATE INDEX "reports_communityId_status_idx" ON "reports"("communityId", "status");
