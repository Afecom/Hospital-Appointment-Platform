/*
  Warnings:

  - You are about to drop the column `doctorType` on the `DoctorHospitalProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DoctorHospitalProfile" DROP COLUMN "doctorType";

-- DropEnum
DROP TYPE "DoctorType";
