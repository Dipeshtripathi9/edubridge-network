-- CreateEnum
CREATE TYPE "VirtualInternshipEvaluationStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "virtual_internship_enrollments" ADD COLUMN     "evaluatedAt" TIMESTAMP(3),
ADD COLUMN     "evaluatedById" TEXT,
ADD COLUMN     "evaluationNote" TEXT,
ADD COLUMN     "evaluationStatus" "VirtualInternshipEvaluationStatus" NOT NULL DEFAULT 'PENDING';
