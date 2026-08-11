-- Adapt the v6 authentication tables to the v7 B2C OTP and activity-log model.
-- OTP codes and public request tokens remain hashed; plaintext secrets are never stored.

ALTER TABLE "OtpChallenge" ADD COLUMN "tokenHash" VARCHAR(64);
ALTER TABLE "OtpChallenge" ADD COLUMN "requestId" UUID;
ALTER TABLE "OtpChallenge" ADD COLUMN "fingerprintHash" VARCHAR(64);
ALTER TABLE "OtpChallenge" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OtpChallenge" ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "OtpChallenge"
SET
  "tokenHash" = md5("id"::text) || md5("id"::text || ':toonswap-otp-token'),
  "requestId" = uuidv7(),
  "verified" = "consumedAt" IS NOT NULL,
  "updatedAt" = COALESCE("consumedAt", "createdAt");

ALTER TABLE "OtpChallenge" ALTER COLUMN "tokenHash" SET NOT NULL;
ALTER TABLE "OtpChallenge" ALTER COLUMN "requestId" SET NOT NULL;
ALTER TABLE "OtpChallenge" ALTER COLUMN "updatedAt" SET NOT NULL;

CREATE UNIQUE INDEX "OtpChallenge_tokenHash_key" ON "OtpChallenge"("tokenHash");
CREATE UNIQUE INDEX "OtpChallenge_requestId_key" ON "OtpChallenge"("requestId");
CREATE UNIQUE INDEX "OtpChallenge_codeHash_tokenHash_requestId_key" ON "OtpChallenge"("codeHash", "tokenHash", "requestId");
CREATE INDEX "OtpChallenge_emailNormalized_verified_createdAt_idx" ON "OtpChallenge"("emailNormalized", "verified", "createdAt" DESC);

ALTER TABLE "AdminAuditLog" RENAME TO "ActivityLog";
ALTER TABLE "ActivityLog" RENAME COLUMN "targetUserId" TO "subjectUserId";
ALTER TABLE "ActivityLog" ADD COLUMN "entityType" VARCHAR(80);
ALTER TABLE "ActivityLog" ADD COLUMN "entityId" VARCHAR(160);
ALTER TABLE "ActivityLog" ADD COLUMN "entityName" VARCHAR(200);
ALTER TABLE "ActivityLog" ADD COLUMN "description" VARCHAR(500);
ALTER TABLE "ActivityLog" ADD COLUMN "updatedAt" TIMESTAMP(3);
ALTER TABLE "ActivityLog" ADD COLUMN "deletedAt" TIMESTAMP(0);

UPDATE "ActivityLog" SET "updatedAt" = "createdAt";
ALTER TABLE "ActivityLog" ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "ActivityLog" RENAME CONSTRAINT "AdminAuditLog_pkey" TO "ActivityLog_pkey";
ALTER TABLE "ActivityLog" RENAME CONSTRAINT "AdminAuditLog_actorUserId_fkey" TO "ActivityLog_actorUserId_fkey";
ALTER TABLE "ActivityLog" RENAME CONSTRAINT "AdminAuditLog_targetUserId_fkey" TO "ActivityLog_subjectUserId_fkey";

DROP INDEX "AdminAuditLog_actorUserId_createdAt_idx";
DROP INDEX "AdminAuditLog_targetUserId_createdAt_idx";
DROP INDEX "AdminAuditLog_action_createdAt_idx";
CREATE INDEX "ActivityLog_actorUserId_createdAt_idx" ON "ActivityLog"("actorUserId", "createdAt" DESC);
CREATE INDEX "ActivityLog_subjectUserId_createdAt_idx" ON "ActivityLog"("subjectUserId", "createdAt" DESC);
CREATE INDEX "ActivityLog_action_createdAt_idx" ON "ActivityLog"("action", "createdAt" DESC);
CREATE INDEX "ActivityLog_entityType_entityId_createdAt_idx" ON "ActivityLog"("entityType", "entityId", "createdAt" DESC);
