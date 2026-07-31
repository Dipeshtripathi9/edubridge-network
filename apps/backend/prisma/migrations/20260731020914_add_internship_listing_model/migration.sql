-- CreateTable
CREATE TABLE "internship_listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "stipend" INTEGER,
    "duration" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "applyUrl" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internship_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internship_listings_slug_key" ON "internship_listings"("slug");

-- CreateIndex
CREATE INDEX "internship_listings_category_idx" ON "internship_listings"("category");

-- CreateIndex
CREATE INDEX "internship_listings_deadline_idx" ON "internship_listings"("deadline");
