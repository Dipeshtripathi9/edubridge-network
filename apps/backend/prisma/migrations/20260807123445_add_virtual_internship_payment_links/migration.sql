-- CreateTable
CREATE TABLE "virtual_internship_payment_links" (
    "id" TEXT NOT NULL,
    "track" "VirtualInternshipTrack" NOT NULL,
    "url" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_internship_payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_internship_payment_links_track_key" ON "virtual_internship_payment_links"("track");
