-- CreateTable
CREATE TABLE "profile_leads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "step1" JSONB,
    "step2" JSONB,
    "step3" JSONB,
    "step4" JSONB,
    "completionPct" INTEGER NOT NULL DEFAULT 0,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_lead_deletions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "reason" TEXT NOT NULL,
    "snapshot" JSONB,
    "deletedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_lead_deletions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_leads_userId_key" ON "profile_leads"("userId");

-- CreateIndex
CREATE INDEX "profile_leads_updatedAt_idx" ON "profile_leads"("updatedAt");

-- CreateIndex
CREATE INDEX "profile_lead_deletions_createdAt_idx" ON "profile_lead_deletions"("createdAt");

-- AddForeignKey
ALTER TABLE "profile_leads" ADD CONSTRAINT "profile_leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
