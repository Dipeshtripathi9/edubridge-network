-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_userId_fkey";

-- DropForeignKey
ALTER TABLE "opportunities" DROP CONSTRAINT "opportunities_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "opportunities" DROP CONSTRAINT "opportunities_createdById_fkey";

-- DropTable
DROP TABLE "applications";

-- DropTable
DROP TABLE "opportunities";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- DropEnum
DROP TYPE "OpportunityType";

