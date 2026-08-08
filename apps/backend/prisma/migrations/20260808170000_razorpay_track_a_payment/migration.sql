-- AlterTable
ALTER TABLE "track_a_enrollments" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "track_a_enrollments_razorpayOrderId_key" ON "track_a_enrollments"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "track_a_enrollments_razorpayPaymentId_key" ON "track_a_enrollments"("razorpayPaymentId");
