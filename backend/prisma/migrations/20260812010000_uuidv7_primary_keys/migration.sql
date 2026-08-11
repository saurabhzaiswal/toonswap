-- Convert every database-model primary key and relation key to PostgreSQL UUID.
-- Human-readable catalog identifiers remain in their unique `slug` fields.

ALTER TABLE "StoryCharacter" DROP CONSTRAINT IF EXISTS "StoryCharacter_projectId_fkey";
ALTER TABLE "StoryCharacter" DROP CONSTRAINT IF EXISTS "StoryCharacter_characterId_fkey";
ALTER TABLE "StoryCharacter" DROP CONSTRAINT IF EXISTS "StoryCharacter_voiceProfileId_fkey";
ALTER TABLE "StoryCharacter" DROP CONSTRAINT IF EXISTS "StoryCharacter_selfInsertAssetId_fkey";
ALTER TABLE "StoryScene" DROP CONSTRAINT IF EXISTS "StoryScene_projectId_fkey";
ALTER TABLE "SelfInsertAsset" DROP CONSTRAINT IF EXISTS "SelfInsertAsset_projectId_fkey";
ALTER TABLE "SelfInsertAsset" DROP CONSTRAINT IF EXISTS "SelfInsertAsset_consentRecordId_fkey";
ALTER TABLE "Character" DROP CONSTRAINT IF EXISTS "Character_defaultVoiceProfileId_fkey";

ALTER TABLE "MemeJob" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "MemeJob" ALTER COLUMN "id" SET DEFAULT uuidv7();
ALTER TABLE "StoryProject" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "StoryProject" ALTER COLUMN "id" SET DEFAULT uuidv7();
ALTER TABLE "StoryCharacter" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "StoryCharacter" ALTER COLUMN "id" SET DEFAULT uuidv7();
ALTER TABLE "StoryCharacter" ALTER COLUMN "projectId" TYPE UUID USING "projectId"::uuid;
ALTER TABLE "StoryScene" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "StoryScene" ALTER COLUMN "id" SET DEFAULT uuidv7();
ALTER TABLE "StoryScene" ALTER COLUMN "projectId" TYPE UUID USING "projectId"::uuid;
ALTER TABLE "ConsentRecord" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "ConsentRecord" ALTER COLUMN "id" SET DEFAULT uuidv7();
ALTER TABLE "SelfInsertAsset" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "SelfInsertAsset" ALTER COLUMN "id" SET DEFAULT uuidv7();
ALTER TABLE "SelfInsertAsset" ALTER COLUMN "projectId" TYPE UUID USING "projectId"::uuid;
ALTER TABLE "SelfInsertAsset" ALTER COLUMN "consentRecordId" TYPE UUID USING "consentRecordId"::uuid;
ALTER TABLE "StoryCharacter" ALTER COLUMN "selfInsertAssetId" TYPE UUID USING "selfInsertAssetId"::uuid;

-- Catalog IDs were previously readable slugs. Generate UUIDv7 IDs while
-- retaining those stable public identifiers in the existing `slug` columns.
ALTER TABLE "Character" ADD COLUMN "_uuid" UUID NOT NULL DEFAULT uuidv7();
ALTER TABLE "VoiceProfile" ADD COLUMN "_uuid" UUID NOT NULL DEFAULT uuidv7();
ALTER TABLE "StoryCharacter" ADD COLUMN "_characterUuid" UUID;
ALTER TABLE "StoryCharacter" ADD COLUMN "_voiceUuid" UUID;
ALTER TABLE "Character" ADD COLUMN "_defaultVoiceUuid" UUID;

UPDATE "StoryCharacter" AS sc
SET "_characterUuid" = c."_uuid"
FROM "Character" AS c
WHERE sc."characterId" = c."id";

UPDATE "StoryCharacter" AS sc
SET "_voiceUuid" = v."_uuid"
FROM "VoiceProfile" AS v
WHERE sc."voiceProfileId" = v."id";

UPDATE "Character" AS c
SET "_defaultVoiceUuid" = v."_uuid"
FROM "VoiceProfile" AS v
WHERE c."defaultVoiceProfileId" = v."id";

DROP INDEX IF EXISTS "StoryCharacter_characterId_idx";
DROP INDEX IF EXISTS "StoryCharacter_voiceProfileId_idx";
ALTER TABLE "Character" DROP CONSTRAINT "Character_pkey";
ALTER TABLE "VoiceProfile" DROP CONSTRAINT "VoiceProfile_pkey";
ALTER TABLE "Character" DROP COLUMN "id";
ALTER TABLE "VoiceProfile" DROP COLUMN "id";
ALTER TABLE "Character" RENAME COLUMN "_uuid" TO "id";
ALTER TABLE "VoiceProfile" RENAME COLUMN "_uuid" TO "id";
ALTER TABLE "Character" ADD CONSTRAINT "Character_pkey" PRIMARY KEY ("id");
ALTER TABLE "VoiceProfile" ADD CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id");

ALTER TABLE "StoryCharacter" DROP COLUMN "characterId";
ALTER TABLE "StoryCharacter" DROP COLUMN "voiceProfileId";
ALTER TABLE "StoryCharacter" RENAME COLUMN "_characterUuid" TO "characterId";
ALTER TABLE "StoryCharacter" RENAME COLUMN "_voiceUuid" TO "voiceProfileId";
ALTER TABLE "Character" DROP COLUMN "defaultVoiceProfileId";
ALTER TABLE "Character" RENAME COLUMN "_defaultVoiceUuid" TO "defaultVoiceProfileId";
ALTER TABLE "Character" ALTER COLUMN "consentRecordId" TYPE UUID USING NULLIF("consentRecordId", '')::uuid;

CREATE INDEX "StoryCharacter_characterId_idx" ON "StoryCharacter"("characterId");
CREATE INDEX "StoryCharacter_voiceProfileId_idx" ON "StoryCharacter"("voiceProfileId");
ALTER TABLE "Character" ADD CONSTRAINT "Character_defaultVoiceProfileId_fkey" FOREIGN KEY ("defaultVoiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StoryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_selfInsertAssetId_fkey" FOREIGN KEY ("selfInsertAssetId") REFERENCES "SelfInsertAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoryScene" ADD CONSTRAINT "StoryScene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StoryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SelfInsertAsset" ADD CONSTRAINT "SelfInsertAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StoryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SelfInsertAsset" ADD CONSTRAINT "SelfInsertAsset_consentRecordId_fkey" FOREIGN KEY ("consentRecordId") REFERENCES "ConsentRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
