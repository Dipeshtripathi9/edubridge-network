-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "accreditation" TEXT,
ADD COLUMN     "admissionPrimary" TEXT,
ADD COLUMN     "admissionSecondary" TEXT,
ADD COLUMN     "hasScholarship" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tuitionFeePerYear" INTEGER,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
