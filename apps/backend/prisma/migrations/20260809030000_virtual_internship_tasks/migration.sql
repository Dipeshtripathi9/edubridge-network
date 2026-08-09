-- AlterEnum
ALTER TYPE "CertificateSourceType" ADD VALUE 'VIRTUAL_INTERNSHIP';

-- CreateTable
CREATE TABLE "virtual_internship_tasks" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "taskIndex" INTEGER NOT NULL,
    "status" "EnrollmentTaskStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submissionUrl" TEXT,
    "submissionNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_internship_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_internship_tasks_enrollmentId_taskIndex_key" ON "virtual_internship_tasks"("enrollmentId", "taskIndex");

-- AddForeignKey
ALTER TABLE "virtual_internship_tasks" ADD CONSTRAINT "virtual_internship_tasks_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "virtual_internship_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
