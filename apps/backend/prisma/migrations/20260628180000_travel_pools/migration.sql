CREATE TABLE "travel_pools" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "destination" TEXT, "startDate" TEXT, "returnDate" TEXT, "budget" TEXT,
  "fromLocation" TEXT, "toLocation" TEXT, "date" TEXT, "time" TEXT, "frequency" TEXT,
  "estimatedFare" TEXT, "costPerPerson" TEXT,
  "seats" INTEGER NOT NULL DEFAULT 4,
  "college" TEXT, "genderPref" TEXT, "description" TEXT,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "travel_pools_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "travel_pools_kind_createdAt_idx" ON "travel_pools"("kind", "createdAt");
ALTER TABLE "travel_pools" ADD CONSTRAINT "travel_pools_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "travel_pool_members" (
  "id" TEXT NOT NULL,
  "poolId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "travel_pool_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "travel_pool_members_poolId_userId_key" ON "travel_pool_members"("poolId", "userId");
ALTER TABLE "travel_pool_members" ADD CONSTRAINT "travel_pool_members_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "travel_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "travel_pool_members" ADD CONSTRAINT "travel_pool_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
