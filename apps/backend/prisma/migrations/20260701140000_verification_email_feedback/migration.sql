ALTER TABLE "verification_requests" ADD COLUMN "collegeEmailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "verification_requests" ADD COLUMN "feedback" JSONB;
