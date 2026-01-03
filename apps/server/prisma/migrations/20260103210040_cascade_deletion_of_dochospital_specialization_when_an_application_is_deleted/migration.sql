-- DropForeignKey
ALTER TABLE "DoctorApplicationSpecialization" DROP CONSTRAINT "DoctorApplicationSpecialization_doctorApplicationId_fkey";

-- AddForeignKey
ALTER TABLE "DoctorApplicationSpecialization" ADD CONSTRAINT "DoctorApplicationSpecialization_doctorApplicationId_fkey" FOREIGN KEY ("doctorApplicationId") REFERENCES "DoctorApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
