-- Remove the Virtual Internship feature entirely (backend + data).
-- Explicit data cleanup BEFORE the enum alterations below, since Postgres
-- enum-value removal fails if any row still references the removed value.
DELETE FROM "certificates" WHERE "sourceType" = 'VIRTUAL_INTERNSHIP';
DELETE FROM "notifications" WHERE "type" IN ('VIRTUAL_INTERNSHIP_PAYMENT_CLICKED', 'VIRTUAL_INTERNSHIP_PAYMENT_REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "CertificateSourceType_new" AS ENUM ('TRACK_A_ENROLLMENT', 'TRACK_B_APPLICATION');
ALTER TABLE "certificates" ALTER COLUMN "sourceType" TYPE "CertificateSourceType_new" USING ("sourceType"::text::"CertificateSourceType_new");
ALTER TYPE "CertificateSourceType" RENAME TO "CertificateSourceType_old";
ALTER TYPE "CertificateSourceType_new" RENAME TO "CertificateSourceType";
DROP TYPE "CertificateSourceType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('LIKE', 'COMMENT', 'MENTION', 'MESSAGE', 'FOLLOW', 'SCHOLARSHIP', 'INTERNSHIP_DEADLINE', 'TRANSFER_UPDATE', 'BADGE_EARNED', 'SYSTEM', 'INTERNSHIP_PAYMENT_CONFIRMED', 'INTERNSHIP_TASK_ASSIGNED', 'INTERNSHIP_TASK_REVIEWED', 'INTERNSHIP_APPLICATION_ALLOCATED', 'INTERNSHIP_APPLICATION_REVIEWED', 'INTERNSHIP_PAYOUT_SENT', 'CERTIFICATE_ISSUED');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "virtual_internship_enrollments" DROP CONSTRAINT "virtual_internship_enrollments_userId_fkey";

-- DropForeignKey
ALTER TABLE "virtual_internship_feedback" DROP CONSTRAINT "virtual_internship_feedback_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "virtual_internship_feedback" DROP CONSTRAINT "virtual_internship_feedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "virtual_internship_task_submissions" DROP CONSTRAINT "virtual_internship_task_submissions_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "virtual_internship_task_submissions" DROP CONSTRAINT "virtual_internship_task_submissions_taskId_fkey";

-- DropForeignKey
ALTER TABLE "virtual_internship_task_submissions" DROP CONSTRAINT "virtual_internship_task_submissions_userId_fkey";

-- DropTable
DROP TABLE "virtual_internship_enrollments";

-- DropTable
DROP TABLE "virtual_internship_feedback";

-- DropTable
DROP TABLE "virtual_internship_payment_links";

-- DropTable
DROP TABLE "virtual_internship_task_submissions";

-- DropTable
DROP TABLE "virtual_internship_tasks";

-- DropEnum
DROP TYPE "TaskSubmissionStatus";

-- DropEnum
DROP TYPE "VirtualInternshipEvaluationStatus";

-- DropEnum
DROP TYPE "VirtualInternshipTrack";
