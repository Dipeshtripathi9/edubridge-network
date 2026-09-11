-- CreateTable
CREATE TABLE "college_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "college_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "college_applications_collegeId_idx" ON "college_applications"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "college_applications_userId_collegeId_key" ON "college_applications"("userId", "collegeId");

-- AddForeignKey
ALTER TABLE "college_applications" ADD CONSTRAINT "college_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_applications" ADD CONSTRAINT "college_applications_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
