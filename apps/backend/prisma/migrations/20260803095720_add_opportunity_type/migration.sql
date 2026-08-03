-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('INTERNSHIP', 'PART_TIME', 'FREELANCE', 'BLOGGING', 'STARTUP');

-- AlterTable
ALTER TABLE "internship_listings" ADD COLUMN     "type" "OpportunityType" NOT NULL DEFAULT 'INTERNSHIP';

-- CreateIndex
CREATE INDEX "internship_listings_type_idx" ON "internship_listings"("type");
