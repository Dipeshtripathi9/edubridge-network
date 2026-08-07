-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'VIRTUAL_INTERNSHIP_PAYMENT_CLICKED';
ALTER TYPE "NotificationType" ADD VALUE 'VIRTUAL_INTERNSHIP_PAYMENT_REJECTED';

-- AlterTable
ALTER TABLE "virtual_internship_enrollments" ADD COLUMN     "paymentLinkClickedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "virtual_internship_payment_links" ADD COLUMN     "baseFeeAmount" INTEGER,
ALTER COLUMN "url" DROP NOT NULL;
