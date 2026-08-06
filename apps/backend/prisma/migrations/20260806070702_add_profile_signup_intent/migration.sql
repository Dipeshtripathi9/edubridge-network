-- CreateEnum
CREATE TYPE "SignupIntent" AS ENUM ('COLLEGE_ADMISSIONS', 'INTERNSHIPS_JOBS');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "signupIntent" "SignupIntent";
