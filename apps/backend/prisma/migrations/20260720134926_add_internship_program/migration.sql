-- CreateEnum
CREATE TYPE "EnrollmentSubtype" AS ENUM ('GUIDED_LEARNING', 'OWN_PROJECT');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentTaskStatus" AS ENUM ('ASSIGNED', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TrackBApplicationStatus" AS ENUM ('PENDING', 'ALLOCATED', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TrackBAllocationType" AS ENUM ('PAID_CLIENT_WORK', 'SKILL_BUILDING_TASK');

-- CreateEnum
CREATE TYPE "CertificateSourceType" AS ENUM ('TRACK_A_ENROLLMENT', 'TRACK_B_APPLICATION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'INTERNSHIP_PAYMENT_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE 'INTERNSHIP_TASK_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'INTERNSHIP_TASK_REVIEWED';
ALTER TYPE "NotificationType" ADD VALUE 'INTERNSHIP_APPLICATION_ALLOCATED';
ALTER TYPE "NotificationType" ADD VALUE 'INTERNSHIP_APPLICATION_REVIEWED';
ALTER TYPE "NotificationType" ADD VALUE 'INTERNSHIP_PAYOUT_SENT';
ALTER TYPE "NotificationType" ADD VALUE 'CERTIFICATE_ISSUED';

-- CreateTable
CREATE TABLE "track_a_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subtype" "EnrollmentSubtype" NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "feeAmount" INTEGER NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentReferenceNote" TEXT,
    "paidAt" TIMESTAMP(3),
    "paymentConfirmedById" TEXT,
    "mentorNote" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "maintenanceUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_a_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_tasks" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "EnrollmentTaskStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submissionUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_b_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skills" TEXT[],
    "portfolioUrl" TEXT,
    "bio" TEXT,
    "status" "TrackBApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "allocationType" "TrackBAllocationType",
    "allocationNote" TEXT,
    "allocatedById" TEXT,
    "allocatedAt" TIMESTAMP(3),
    "submissionUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "payoutAmount" DOUBLE PRECISION,
    "payoutSentAt" TIMESTAMP(3),
    "payoutNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_b_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" "CertificateSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "track_a_enrollments_userId_status_idx" ON "track_a_enrollments"("userId", "status");

-- CreateIndex
CREATE INDEX "track_a_enrollments_status_createdAt_idx" ON "track_a_enrollments"("status", "createdAt");

-- CreateIndex
CREATE INDEX "enrollment_tasks_enrollmentId_order_idx" ON "enrollment_tasks"("enrollmentId", "order");

-- CreateIndex
CREATE INDEX "track_b_applications_userId_status_idx" ON "track_b_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "track_b_applications_status_createdAt_idx" ON "track_b_applications"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_code_key" ON "certificates"("code");

-- CreateIndex
CREATE INDEX "certificates_recipientId_idx" ON "certificates"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_sourceType_sourceId_key" ON "certificates"("sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "track_a_enrollments" ADD CONSTRAINT "track_a_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_tasks" ADD CONSTRAINT "enrollment_tasks_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "track_a_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_b_applications" ADD CONSTRAINT "track_b_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
