-- CreateTable
CREATE TABLE "DoctorApplicationSpecialization" (
    "id" TEXT NOT NULL,
    "doctorApplicationId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorApplicationSpecialization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DoctorApplicationSpecialization" ADD CONSTRAINT "DoctorApplicationSpecialization_doctorApplicationId_fkey" FOREIGN KEY ("doctorApplicationId") REFERENCES "DoctorApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorApplicationSpecialization" ADD CONSTRAINT "DoctorApplicationSpecialization_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
