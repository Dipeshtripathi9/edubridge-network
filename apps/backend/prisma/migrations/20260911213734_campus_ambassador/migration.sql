-- AlterTable: track who referred each user in (?ref=<code> at signup)
ALTER TABLE "users" ADD COLUMN "referredById" TEXT;

-- CreateIndex
CREATE INDEX "users_referredById_idx" ON "users"("referredById");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "CampusAmbassadorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "campus_ambassador_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "CampusAmbassadorStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "campus_ambassador_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campus_ambassador_applications_userId_key" ON "campus_ambassador_applications"("userId");

-- CreateIndex
CREATE INDEX "campus_ambassador_applications_status_idx" ON "campus_ambassador_applications"("status");

-- AddForeignKey
ALTER TABLE "campus_ambassador_applications" ADD CONSTRAINT "campus_ambassador_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
