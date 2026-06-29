CREATE TABLE "mentor_requests" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "course" TEXT,
  "location" TEXT,
  "marks" TEXT,
  "budget" TEXT,
  "category" TEXT,
  "preferredCollege" TEXT,
  "contactMethod" TEXT,
  "message" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mentor_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "mentor_requests_createdAt_idx" ON "mentor_requests"("createdAt");
