-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommunityRole" ADD VALUE 'CAMPUS_LEAD';
ALTER TYPE "CommunityRole" ADD VALUE 'OPPORTUNITY_HEAD';
ALTER TYPE "CommunityRole" ADD VALUE 'STUDENT_RELATIONS_HEAD';

-- CreateTable
CREATE TABLE "community_head_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "requestedRole" "CommunityRole" NOT NULL,
    "status" "VerificationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "pitch" TEXT,
    "note" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_head_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_head_applications_status_createdAt_idx" ON "community_head_applications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "community_head_applications_userId_idx" ON "community_head_applications"("userId");

-- AddForeignKey
ALTER TABLE "community_head_applications" ADD CONSTRAINT "community_head_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_head_applications" ADD CONSTRAINT "community_head_applications_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
