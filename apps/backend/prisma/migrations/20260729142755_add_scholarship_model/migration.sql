-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amountPerYear" INTEGER NOT NULL,
    "renewalYears" INTEGER,
    "category" TEXT NOT NULL,
    "eligibilityText" TEXT NOT NULL,
    "minCgpa" DOUBLE PRECISION,
    "eligibleCourses" TEXT[],
    "eligibleStates" TEXT[],
    "applyUrl" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_slug_key" ON "scholarships"("slug");

-- CreateIndex
CREATE INDEX "scholarships_category_idx" ON "scholarships"("category");

-- CreateIndex
CREATE INDEX "scholarships_deadline_idx" ON "scholarships"("deadline");
