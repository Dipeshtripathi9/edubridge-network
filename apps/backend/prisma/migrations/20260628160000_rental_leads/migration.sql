CREATE TABLE "rental_leads" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "college" TEXT,
  "location" TEXT,
  "propertyType" TEXT,
  "budget" TEXT,
  "moveInDate" TEXT,
  "occupants" TEXT,
  "gender" TEXT,
  "furnished" TEXT,
  "requirements" TEXT,
  "participant" TEXT,
  "driveUrl" TEXT,
  "details" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rental_leads_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "rental_leads_kind_createdAt_idx" ON "rental_leads"("kind", "createdAt");
