-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "hiringOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hiringNote" TEXT;
