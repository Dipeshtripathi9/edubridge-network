-- CreateEnum
CREATE TYPE "VirtualInternshipTrack" AS ENUM ('WEEK', 'MONTH');

-- CreateTable
CREATE TABLE "virtual_internship_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "track" "VirtualInternshipTrack" NOT NULL,
    "referralApplied" BOOLEAN NOT NULL DEFAULT false,
    "donateApplied" BOOLEAN NOT NULL DEFAULT false,
    "feeAmount" INTEGER NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_internship_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_internship_enrollments_razorpayOrderId_key" ON "virtual_internship_enrollments"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_internship_enrollments_razorpayPaymentId_key" ON "virtual_internship_enrollments"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "virtual_internship_enrollments_userId_status_idx" ON "virtual_internship_enrollments"("userId", "status");

-- AddForeignKey
ALTER TABLE "virtual_internship_enrollments" ADD CONSTRAINT "virtual_internship_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
