-- Authentication architecture migration.
-- Existing anonymous records are preserved under a blocked, non-login legacy
-- owner. Do not run this migration against production without first reviewing
-- the backfill and deciding whether legacy records should instead be exported
-- or deleted.

DO $$
BEGIN
  IF to_regprocedure('uuidv7()') IS NULL THEN
    RAISE EXCEPTION 'ToonSwap requires PostgreSQL uuidv7(). Use PostgreSQL 18+ or install a provider-supported UUIDv7 function before this migration.';
  END IF;
END $$;

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETION_PENDING');
CREATE TYPE "AgeGateStatus" AS ENUM ('POLICY_REQUIRED', 'ELIGIBLE', 'GUARDIAN_REQUIRED', 'GUARDIAN_APPROVED');
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL_OTP', 'GOOGLE');
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'SIGNUP');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT uuidv7(),
  "email" VARCHAR(320) NOT NULL,
  "emailNormalized" VARCHAR(320) NOT NULL,
  "emailVerifiedAt" TIMESTAMP(3),
  "name" VARCHAR(120),
  "dateOfBirth" DATE,
  "city" VARCHAR(120),
  "countryCode" VARCHAR(2),
  "locale" VARCHAR(16),
  "timezone" VARCHAR(64),
  "avatarObjectKey" TEXT,
  "pendingAvatarObjectKey" TEXT,
  "avatarMimeType" VARCHAR(80),
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "ageGateStatus" "AgeGateStatus" NOT NULL DEFAULT 'POLICY_REQUIRED',
  "profileComplete" BOOLEAN NOT NULL DEFAULT false,
  "termsAcceptedAt" TIMESTAMP(3),
  "privacyAcceptedAt" TIMESTAMP(3),
  "lastLoginAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3),
  "blockedAt" TIMESTAMP(3),
  "blockedReason" VARCHAR(300),
  "deletionRequestedAt" TIMESTAMP(3),
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthIdentity" (
  "id" UUID NOT NULL DEFAULT uuidv7(),
  "userId" UUID NOT NULL,
  "provider" "AuthProvider" NOT NULL,
  "providerSubject" VARCHAR(255) NOT NULL,
  "providerEmail" VARCHAR(320),
  "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthSession" (
  "id" UUID NOT NULL DEFAULT uuidv7(),
  "userId" UUID NOT NULL,
  "tokenHash" VARCHAR(64) NOT NULL,
  "csrfTokenHash" VARCHAR(64) NOT NULL,
  "ipHash" VARCHAR(64),
  "userAgent" VARCHAR(500),
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OtpChallenge" (
  "id" UUID NOT NULL DEFAULT uuidv7(),
  "emailNormalized" VARCHAR(320) NOT NULL,
  "purpose" "OtpPurpose" NOT NULL,
  "codeHash" VARCHAR(64) NOT NULL,
  "requestIpHash" VARCHAR(64),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsagePolicyOverride" (
  "id" UUID NOT NULL DEFAULT uuidv7(),
  "userId" UUID NOT NULL,
  "generationLimit" INTEGER,
  "windowDays" INTEGER,
  "unlimited" BOOLEAN NOT NULL DEFAULT false,
  "note" VARCHAR(300),
  "updatedByUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UsagePolicyOverride_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminAuditLog" (
  "id" UUID NOT NULL DEFAULT uuidv7(),
  "actorUserId" UUID,
  "targetUserId" UUID,
  "action" VARCHAR(80) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- Preserve anonymous data without granting it to a real account.
INSERT INTO "User" (
  "id", "email", "emailNormalized", "role", "status", "ageGateStatus",
  "profileComplete", "isSystem", "blockedAt", "blockedReason", "updatedAt"
) VALUES (
  '00000000-0000-7000-8000-000000000001',
  'legacy-anonymous@invalid.toonswap.local',
  'legacy-anonymous@invalid.toonswap.local',
  'USER',
  'BLOCKED',
  'POLICY_REQUIRED',
  false,
  true,
  CURRENT_TIMESTAMP,
  'Blocked migration owner for pre-auth records',
  CURRENT_TIMESTAMP
);

ALTER TABLE "MemeJob" ADD COLUMN "userId" UUID;
ALTER TABLE "StoryProject" ADD COLUMN "userId" UUID;
ALTER TABLE "ConsentRecord" ADD COLUMN "userId" UUID;
ALTER TABLE "SelfInsertAsset" ADD COLUMN "userId" UUID;
ALTER TABLE "Character" ADD COLUMN "ownerUserId" UUID;

UPDATE "MemeJob" SET "userId" = '00000000-0000-7000-8000-000000000001' WHERE "userId" IS NULL;
UPDATE "StoryProject" SET "userId" = '00000000-0000-7000-8000-000000000001' WHERE "userId" IS NULL;
UPDATE "ConsentRecord" SET "userId" = '00000000-0000-7000-8000-000000000001' WHERE "userId" IS NULL;
UPDATE "SelfInsertAsset" SET "userId" = '00000000-0000-7000-8000-000000000001' WHERE "userId" IS NULL;
UPDATE "Character"
SET "ownerUserId" = '00000000-0000-7000-8000-000000000001'
WHERE "ownerSessionId" IS NOT NULL;

ALTER TABLE "MemeJob" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "StoryProject" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "ConsentRecord" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SelfInsertAsset" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "StoryProject" DROP COLUMN "ownerSessionId";
ALTER TABLE "ConsentRecord" DROP COLUMN "ownerSessionId";
ALTER TABLE "SelfInsertAsset" DROP COLUMN "ownerSessionId";
ALTER TABLE "Character" DROP COLUMN "ownerSessionId";

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_emailNormalized_key" ON "User"("emailNormalized");
CREATE INDEX "User_status_lastSeenAt_idx" ON "User"("status", "lastSeenAt" DESC);
CREATE INDEX "User_role_status_createdAt_idx" ON "User"("role", "status", "createdAt" DESC);
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt" DESC);

CREATE UNIQUE INDEX "AuthIdentity_provider_providerSubject_key" ON "AuthIdentity"("provider", "providerSubject");
CREATE UNIQUE INDEX "AuthIdentity_userId_provider_key" ON "AuthIdentity"("userId", "provider");
CREATE INDEX "AuthIdentity_userId_lastUsedAt_idx" ON "AuthIdentity"("userId", "lastUsedAt" DESC);
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");
CREATE INDEX "AuthSession_userId_revokedAt_expiresAt_idx" ON "AuthSession"("userId", "revokedAt", "expiresAt");
CREATE INDEX "AuthSession_expiresAt_revokedAt_idx" ON "AuthSession"("expiresAt", "revokedAt");
CREATE INDEX "OtpChallenge_emailNormalized_createdAt_idx" ON "OtpChallenge"("emailNormalized", "createdAt" DESC);
CREATE INDEX "OtpChallenge_requestIpHash_createdAt_idx" ON "OtpChallenge"("requestIpHash", "createdAt" DESC);
CREATE INDEX "OtpChallenge_expiresAt_consumedAt_idx" ON "OtpChallenge"("expiresAt", "consumedAt");
CREATE UNIQUE INDEX "UsagePolicyOverride_userId_key" ON "UsagePolicyOverride"("userId");
CREATE INDEX "UsagePolicyOverride_unlimited_updatedAt_idx" ON "UsagePolicyOverride"("unlimited", "updatedAt" DESC);
CREATE INDEX "AdminAuditLog_actorUserId_createdAt_idx" ON "AdminAuditLog"("actorUserId", "createdAt" DESC);
CREATE INDEX "AdminAuditLog_targetUserId_createdAt_idx" ON "AdminAuditLog"("targetUserId", "createdAt" DESC);
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt" DESC);
CREATE INDEX "MemeJob_userId_createdAt_idx" ON "MemeJob"("userId", "createdAt" DESC);
CREATE INDEX "MemeJob_userId_status_createdAt_idx" ON "MemeJob"("userId", "status", "createdAt" DESC);
CREATE INDEX "Character_ownerUserId_idx" ON "Character"("ownerUserId");
CREATE INDEX "StoryProject_userId_updatedAt_idx" ON "StoryProject"("userId", "updatedAt" DESC);
CREATE INDEX "ConsentRecord_userId_createdAt_idx" ON "ConsentRecord"("userId", "createdAt" DESC);
CREATE INDEX "SelfInsertAsset_userId_status_updatedAt_idx" ON "SelfInsertAsset"("userId", "status", "updatedAt" DESC);

-- Efficient case-insensitive admin search. This is PostgreSQL-specific and is
-- intentionally kept in SQL because Prisma 5 cannot express operator classes.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "User_emailNormalized_trgm_idx" ON "User" USING GIN ("emailNormalized" gin_trgm_ops);
CREATE INDEX "User_name_trgm_idx" ON "User" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "User_city_trgm_idx" ON "User" USING GIN ("city" gin_trgm_ops);

ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsagePolicyOverride" ADD CONSTRAINT "UsagePolicyOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MemeJob" ADD CONSTRAINT "MemeJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Character" ADD CONSTRAINT "Character_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryProject" ADD CONSTRAINT "StoryProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SelfInsertAsset" ADD CONSTRAINT "SelfInsertAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SelfInsertAsset" DROP CONSTRAINT IF EXISTS "SelfInsertAsset_consentRecordId_fkey";
ALTER TABLE "SelfInsertAsset" ADD CONSTRAINT "SelfInsertAsset_consentRecordId_fkey" FOREIGN KEY ("consentRecordId") REFERENCES "ConsentRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
