-- CreateEnum
CREATE TYPE "TaskSubmissionStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "virtual_internship_tasks" (
    "id" TEXT NOT NULL,
    "track" "VirtualInternshipTrack" NOT NULL,
    "monthNum" INTEGER,
    "weekNum" INTEGER NOT NULL,
    "monthTitle" TEXT,
    "monthDesc" TEXT,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "deliverable" TEXT NOT NULL,
    "steps" TEXT[],
    "hours" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_internship_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_internship_task_submissions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "status" "TaskSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_internship_task_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_internship_tasks_track_monthNum_weekNum_key" ON "virtual_internship_tasks"("track", "monthNum", "weekNum");

-- CreateIndex
CREATE INDEX "virtual_internship_task_submissions_enrollmentId_idx" ON "virtual_internship_task_submissions"("enrollmentId");

-- CreateIndex
CREATE INDEX "virtual_internship_task_submissions_status_idx" ON "virtual_internship_task_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_internship_task_submissions_taskId_enrollmentId_key" ON "virtual_internship_task_submissions"("taskId", "enrollmentId");

-- AddForeignKey
ALTER TABLE "virtual_internship_task_submissions" ADD CONSTRAINT "virtual_internship_task_submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "virtual_internship_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_internship_task_submissions" ADD CONSTRAINT "virtual_internship_task_submissions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "virtual_internship_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_internship_task_submissions" ADD CONSTRAINT "virtual_internship_task_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
