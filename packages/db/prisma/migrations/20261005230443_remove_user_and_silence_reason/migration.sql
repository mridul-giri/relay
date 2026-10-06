/*
  Warnings:

  - The values [SILENCE] on the enum `CallReason` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CallReason_new" AS ENUM ('DELAY');
ALTER TABLE "CallAttempt" ALTER COLUMN "reason" TYPE "CallReason_new" USING ("reason"::text::"CallReason_new");
ALTER TYPE "CallReason" RENAME TO "CallReason_old";
ALTER TYPE "CallReason_new" RENAME TO "CallReason";
DROP TYPE "public"."CallReason_old";
COMMIT;

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";
