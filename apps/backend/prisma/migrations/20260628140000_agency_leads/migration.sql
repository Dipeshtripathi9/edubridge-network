CREATE TABLE "agency_leads" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "services" TEXT[],
  "message" TEXT,
  "role" TEXT,
  "projectUrl" TEXT,
  "videoUrls" TEXT[],
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agency_leads_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "agency_leads_kind_createdAt_idx" ON "agency_leads"("kind", "createdAt");
