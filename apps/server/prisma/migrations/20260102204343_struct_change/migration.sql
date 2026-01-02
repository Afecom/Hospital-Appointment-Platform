/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,hospitalId]` on the table `DoctorHospitalApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DoctorHospitalApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "DoctorHospitalApplication" ADD COLUMN     "status" "DoctorHospitalApplicationStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "DoctorHospitalApplication_doctorId_hospitalId_key" ON "DoctorHospitalApplication"("doctorId", "hospitalId");
