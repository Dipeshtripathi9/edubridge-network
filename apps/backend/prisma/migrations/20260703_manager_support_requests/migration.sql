-- CreateTable
CREATE TABLE "manager_support_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manager_support_requests_status_createdAt_idx" ON "manager_support_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "manager_support_requests_userId_idx" ON "manager_support_requests"("userId");

-- AddForeignKey
ALTER TABLE "manager_support_requests" ADD CONSTRAINT "manager_support_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
