CREATE TYPE "SelfInsertStatus" AS ENUM ('DRAFT', 'QUEUED', 'PROCESSING', 'READY', 'FAILED', 'DELETED');
CREATE TYPE "SelfInsertVoiceMode" AS ENUM ('AS_IS', 'CONVERT');

CREATE TABLE "ConsentRecord" (
  "id" TEXT NOT NULL,
  "ownerSessionId" TEXT NOT NULL,
  "likenessAuthorized" BOOLEAN NOT NULL,
  "voiceAuthorized" BOOLEAN NOT NULL,
  "retentionAccepted" BOOLEAN NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "withdrawnAt" TIMESTAMP(3),
  CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SelfInsertAsset" (
  "id" TEXT NOT NULL,
  "ownerSessionId" TEXT NOT NULL,
  "projectId" TEXT,
  "consentRecordId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "photoSourceUrl" TEXT,
  "voiceSourceUrl" TEXT,
  "characterReferenceUrl" TEXT,
  "voiceReferenceUrl" TEXT,
  "voiceMode" "SelfInsertVoiceMode" NOT NULL DEFAULT 'AS_IS',
  "voiceStyle" TEXT,
  "status" "SelfInsertStatus" NOT NULL DEFAULT 'DRAFT',
  "failureReason" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SelfInsertAsset_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StoryCharacter" ADD COLUMN "selfInsertAssetId" TEXT;

CREATE INDEX "ConsentRecord_ownerSessionId_createdAt_idx" ON "ConsentRecord"("ownerSessionId", "createdAt");
CREATE INDEX "SelfInsertAsset_ownerSessionId_status_idx" ON "SelfInsertAsset"("ownerSessionId", "status");
CREATE INDEX "SelfInsertAsset_projectId_idx" ON "SelfInsertAsset"("projectId");
CREATE INDEX "SelfInsertAsset_expiresAt_status_idx" ON "SelfInsertAsset"("expiresAt", "status");
CREATE INDEX "StoryCharacter_selfInsertAssetId_idx" ON "StoryCharacter"("selfInsertAssetId");

ALTER TABLE "SelfInsertAsset" ADD CONSTRAINT "SelfInsertAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StoryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SelfInsertAsset" ADD CONSTRAINT "SelfInsertAsset_consentRecordId_fkey" FOREIGN KEY ("consentRecordId") REFERENCES "ConsentRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_selfInsertAssetId_fkey" FOREIGN KEY ("selfInsertAssetId") REFERENCES "SelfInsertAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
