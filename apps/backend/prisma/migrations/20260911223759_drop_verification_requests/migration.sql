-- Remove the self-service college-verification request queue entirely
-- (submission flow, admin review tab, and the analysis page built on top
-- of it). Profile.collegeVerification and its CollegeVerificationStatus
-- enum stay — that flag is still set via the separate admin manual
-- toggle and read by blog/reviews/resources gating elsewhere.
DROP TABLE "verification_requests";

-- DropEnum
DROP TYPE "VerificationMethod";

-- DropEnum
DROP TYPE "VerificationRequestStatus";
