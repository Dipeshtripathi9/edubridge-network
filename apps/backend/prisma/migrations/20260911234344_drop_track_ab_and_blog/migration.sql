-- Remove the paid Track A/B virtual-internship program entirely
-- (enrollment, tasks, applications, admin tooling, Razorpay payments).
-- Certificate/CertificateSourceType stay — shared infra also used by the
-- separate VirtualInternship models, and existing certificate rows must
-- remain independently verifiable via /verify-certificate.
-- EnrollmentStatus/EnrollmentTaskStatus stay for the same reason
-- (VirtualInternshipEnrollment/VirtualInternshipTask still use them).
DROP TABLE "enrollment_tasks";
DROP TABLE "track_a_enrollments";
DROP TABLE "track_b_applications";

-- DropEnum
DROP TYPE "EnrollmentSubtype";
DROP TYPE "TrackBApplicationStatus";
DROP TYPE "TrackBAllocationType";

-- Remove the blog feature entirely (writing was already removed; this
-- drops the remaining read-only list/detail infrastructure).
DROP TABLE "blog_posts";

-- DropEnum
DROP TYPE "BlogCategory";
DROP TYPE "BlogStatus";
