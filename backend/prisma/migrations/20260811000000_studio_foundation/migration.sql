-- ToonSwap initial PostgreSQL schema with the scalable studio foundation.
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');
CREATE TYPE "CatalogStatus" AS ENUM ('LIVE', 'PLANNED', 'RESEARCH', 'ARCHIVED');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PLANNING', 'READY', 'RENDERING', 'COMPLETE', 'FAILED', 'ARCHIVED');
CREATE TYPE "StudioMode" AS ENUM ('SIMPLE', 'CREATOR');
CREATE TYPE "SceneStatus" AS ENUM ('DRAFT', 'APPROVED', 'QUEUED', 'RENDERING', 'COMPLETE', 'FAILED');

CREATE TABLE "MemeJob" (
  "id" TEXT NOT NULL, "character" TEXT NOT NULL, "language" TEXT NOT NULL DEFAULT 'hindi',
  "voiceStyle" TEXT NOT NULL DEFAULT 'comedy-uncle', "selfieUrl" TEXT NOT NULL, "voiceUrl" TEXT,
  "scriptText" TEXT, "status" "JobStatus" NOT NULL DEFAULT 'PENDING', "outputUrl" TEXT,
  "errorMessage" TEXT, "watermarked" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MemeJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Character" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "worldId" TEXT NOT NULL,
  "worldName" TEXT NOT NULL, "era" TEXT NOT NULL, "archetype" TEXT NOT NULL, "personality" TEXT NOT NULL,
  "movementStyle" JSONB NOT NULL, "visualBrief" JSONB NOT NULL, "imageUrl" TEXT, "thumbnailUrl" TEXT,
  "tags" JSONB, "status" "CatalogStatus" NOT NULL DEFAULT 'PLANNED', "isSystem" BOOLEAN NOT NULL DEFAULT true,
  "ownerSessionId" TEXT, "consentRecordId" TEXT, "defaultVoiceProfileId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VoiceProfile" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "languageCode" TEXT NOT NULL,
  "languageName" TEXT NOT NULL, "region" TEXT NOT NULL, "direction" TEXT NOT NULL, "ageFeel" TEXT,
  "genderPresentation" TEXT, "emotionalRange" JSONB NOT NULL, "previewUrl" TEXT, "providerVoiceId" TEXT,
  "providerMetadata" JSONB, "consentRequired" BOOLEAN NOT NULL DEFAULT false,
  "status" "CatalogStatus" NOT NULL DEFAULT 'RESEARCH',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoryProject" (
  "id" TEXT NOT NULL, "ownerSessionId" TEXT NOT NULL, "title" TEXT NOT NULL, "prompt" TEXT NOT NULL,
  "worldId" TEXT NOT NULL, "genre" TEXT NOT NULL, "audience" TEXT NOT NULL, "visualStyle" TEXT NOT NULL,
  "primaryLanguageCode" TEXT NOT NULL, "targetDurationSeconds" INTEGER NOT NULL,
  "captionsEnabled" BOOLEAN NOT NULL DEFAULT true, "mode" "StudioMode" NOT NULL DEFAULT 'SIMPLE',
  "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT', "version" INTEGER NOT NULL DEFAULT 1,
  "moderationState" JSONB, "costEstimate" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoryProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoryCharacter" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "characterId" TEXT, "voiceProfileId" TEXT,
  "role" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL, "customSnapshot" JSONB, "direction" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoryCharacter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoryScene" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL, "title" TEXT NOT NULL,
  "durationSeconds" INTEGER NOT NULL, "characters" TEXT NOT NULL, "location" TEXT NOT NULL,
  "action" TEXT NOT NULL, "dialogue" TEXT, "expression" TEXT NOT NULL, "camera" TEXT NOT NULL,
  "audioMode" TEXT NOT NULL, "regenerationScope" TEXT NOT NULL, "continuity" TEXT,
  "promptSnapshot" JSONB, "outputLayers" JSONB, "status" "SceneStatus" NOT NULL DEFAULT 'DRAFT',
  "version" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "StoryScene_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MemeJob_status_idx" ON "MemeJob"("status");
CREATE UNIQUE INDEX "Character_slug_key" ON "Character"("slug");
CREATE INDEX "Character_worldId_status_idx" ON "Character"("worldId", "status");
CREATE INDEX "Character_ownerSessionId_idx" ON "Character"("ownerSessionId");
CREATE UNIQUE INDEX "VoiceProfile_slug_key" ON "VoiceProfile"("slug");
CREATE INDEX "VoiceProfile_languageCode_status_idx" ON "VoiceProfile"("languageCode", "status");
CREATE INDEX "VoiceProfile_region_idx" ON "VoiceProfile"("region");
CREATE INDEX "StoryProject_ownerSessionId_updatedAt_idx" ON "StoryProject"("ownerSessionId", "updatedAt");
CREATE INDEX "StoryProject_status_updatedAt_idx" ON "StoryProject"("status", "updatedAt");
CREATE INDEX "StoryCharacter_characterId_idx" ON "StoryCharacter"("characterId");
CREATE INDEX "StoryCharacter_voiceProfileId_idx" ON "StoryCharacter"("voiceProfileId");
CREATE UNIQUE INDEX "StoryCharacter_projectId_sortOrder_key" ON "StoryCharacter"("projectId", "sortOrder");
CREATE INDEX "StoryScene_projectId_status_idx" ON "StoryScene"("projectId", "status");
CREATE UNIQUE INDEX "StoryScene_projectId_sortOrder_key" ON "StoryScene"("projectId", "sortOrder");

ALTER TABLE "Character" ADD CONSTRAINT "Character_defaultVoiceProfileId_fkey" FOREIGN KEY ("defaultVoiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StoryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoryScene" ADD CONSTRAINT "StoryScene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StoryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
