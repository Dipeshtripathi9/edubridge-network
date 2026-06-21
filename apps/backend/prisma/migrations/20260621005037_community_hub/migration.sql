-- CreateEnum
CREATE TYPE "PostKind" AS ENUM ('DISCUSSION', 'QUESTION', 'PLACEMENT_EXPERIENCE', 'INTERNSHIP_EXPERIENCE', 'RESOURCE_SHARE', 'POLL');

-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "coverUrl" TEXT;

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN     "collegeId" TEXT;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kind" "PostKind" NOT NULL DEFAULT 'DISCUSSION';

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "collegeId" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "college_faqs" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "college_faqs_collegeId_order_idx" ON "college_faqs"("collegeId", "order");

-- CreateIndex
CREATE INDEX "opportunities_collegeId_idx" ON "opportunities"("collegeId");

-- CreateIndex
CREATE INDEX "resources_collegeId_idx" ON "resources"("collegeId");

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_faqs" ADD CONSTRAINT "college_faqs_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
