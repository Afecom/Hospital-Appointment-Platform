/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Schedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_createdBy_fkey";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "createdBy";
