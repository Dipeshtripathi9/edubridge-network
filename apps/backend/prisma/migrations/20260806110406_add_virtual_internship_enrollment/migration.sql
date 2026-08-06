-- CreateEnum
CREATE TYPE "VirtualInternshipTrack" AS ENUM ('FOUR_WEEK', 'FOUR_MONTH');

-- CreateTable
CREATE TABLE "virtual_internship_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "track" "VirtualInternshipTrack" NOT NULL,
    "feeAmount" INTEGER NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentReferenceNote" TEXT,
    "paidAt" TIMESTAMP(3),
    "paymentConfirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_internship_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "virtual_internship_enrollments_userId_status_idx" ON "virtual_internship_enrollments"("userId", "status");

-- CreateIndex
CREATE INDEX "virtual_internship_enrollments_status_createdAt_idx" ON "virtual_internship_enrollments"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "virtual_internship_enrollments" ADD CONSTRAINT "virtual_internship_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
