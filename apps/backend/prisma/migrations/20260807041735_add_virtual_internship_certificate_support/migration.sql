-- AlterEnum
ALTER TYPE "CertificateSourceType" ADD VALUE 'VIRTUAL_INTERNSHIP';

-- AlterTable
ALTER TABLE "virtual_internship_enrollments" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedById" TEXT;
