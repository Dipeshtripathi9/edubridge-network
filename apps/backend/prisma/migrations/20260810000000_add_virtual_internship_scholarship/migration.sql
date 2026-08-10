-- AlterTable
ALTER TABLE "virtual_internship_enrollments" ADD COLUMN     "scholarshipApplied" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "virtual_internship_scholarships" (
    "id" TEXT NOT NULL,
    "track" "VirtualInternshipTrack" NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_internship_scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_internship_scholarships_track_key" ON "virtual_internship_scholarships"("track");

