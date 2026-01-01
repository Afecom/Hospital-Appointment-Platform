/*
  Warnings:

  - You are about to drop the column `hospitalId` on the `DoctorApplication` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DoctorApplication" DROP CONSTRAINT "DoctorApplication_hospitalId_fkey";

-- DropIndex
DROP INDEX "DoctorApplication_userId_hospitalId_key";

-- AlterTable
ALTER TABLE "DoctorApplication" DROP COLUMN "hospitalId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "OperatorHospitalId" TEXT,
ADD COLUMN     "UserHospitalId" TEXT;

-- CreateTable
CREATE TABLE "DoctorHospitalApplication" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorHospitalApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DoctorHospitalApplication" ADD CONSTRAINT "DoctorHospitalApplication_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorHospitalApplication" ADD CONSTRAINT "DoctorHospitalApplication_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_OperatorHospitalId_fkey" FOREIGN KEY ("OperatorHospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_UserHospitalId_fkey" FOREIGN KEY ("UserHospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
