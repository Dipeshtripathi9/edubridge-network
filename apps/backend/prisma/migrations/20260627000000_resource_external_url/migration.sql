-- Resources can be shared as an external (Google Drive) link; file uploads become optional.
ALTER TABLE "resources" ADD COLUMN "externalUrl" TEXT;
ALTER TABLE "resources" ALTER COLUMN "fileKey" DROP NOT NULL;
