-- Remove ChatType.COMMUNITY and ReviewCategory.COMMUNITY_MANAGERS. No code
-- path has ever created rows with either value (verified across the
-- codebase), but Postgres can't drop a single enum value in place — the
-- standard-safe way is to recreate the type. Any existing row using the
-- removed value is reassigned to the closest fallback first, so this
-- succeeds whether or not such rows actually exist.

-- ReviewCategory: COMMUNITY_MANAGERS -> CAMPUS_LIFE
UPDATE "reviews" SET "category" = 'CAMPUS_LIFE' WHERE "category" = 'COMMUNITY_MANAGERS';

CREATE TYPE "ReviewCategory_new" AS ENUM ('PLACEMENT', 'HOSTEL', 'FACULTY', 'CAMPUS_LIFE', 'ROI');
ALTER TABLE "reviews" ALTER COLUMN "category" TYPE "ReviewCategory_new" USING ("category"::text::"ReviewCategory_new");
DROP TYPE "ReviewCategory";
ALTER TYPE "ReviewCategory_new" RENAME TO "ReviewCategory";

-- ChatType: COMMUNITY -> GROUP
UPDATE "chats" SET "type" = 'GROUP' WHERE "type" = 'COMMUNITY';

CREATE TYPE "ChatType_new" AS ENUM ('DIRECT', 'GROUP');
ALTER TABLE "chats" ALTER COLUMN "type" TYPE "ChatType_new" USING ("type"::text::"ChatType_new");
DROP TYPE "ChatType";
ALTER TYPE "ChatType_new" RENAME TO "ChatType";
