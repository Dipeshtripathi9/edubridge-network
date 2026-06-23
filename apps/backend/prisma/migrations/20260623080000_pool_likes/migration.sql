-- AlterTable
ALTER TABLE "pools" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "pool_likes" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pool_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pool_likes_userId_idx" ON "pool_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pool_likes_poolId_userId_key" ON "pool_likes"("poolId", "userId");

-- AddForeignKey
ALTER TABLE "pool_likes" ADD CONSTRAINT "pool_likes_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_likes" ADD CONSTRAINT "pool_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
