-- AlterEnum
ALTER TYPE "ReviewCategory" ADD VALUE 'ROI';
ALTER TYPE "ReviewCategory" ADD VALUE 'COMMUNITY_MANAGERS';

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "collegeId" DROP NOT NULL,
ADD COLUMN     "communityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_communityId_authorId_category_key" ON "reviews"("communityId", "authorId", "category");

-- CreateIndex
CREATE INDEX "reviews_communityId_category_idx" ON "reviews"("communityId", "category");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
