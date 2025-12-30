import { PrismaClient as PrismaClient$1 } from '../generated/prisma/client.js';
export { Appointment, AuditLog, Doctor, DoctorApplication, DoctorHospitalProfile, DoctorSpecialization, Hospital, HospitalSpecialization, Notification, Payment, Review, SavedDoctorHospital, Schedule, SearchLog, Slot, Specialization, User, account, session, verification } from '../generated/prisma/client.js';
export { e as $Enums, A as AppointmentStatus, D as DoctorApplicationStatus, a as DoctorType, H as HospitalType, R as Role, S as SchedulePeriod, b as ScheduleStatus, c as ScheduleType, d as SlotStatus, g as gender } from '../enums-CHmCo_GR.js';
export { p as Prisma } from '../class-DT9Uo5xf.js';
import '@prisma/client/runtime/client';

declare class PrismaClient extends PrismaClient$1 {
    constructor(options?: ConstructorParameters<typeof PrismaClient$1>[0]);
}
declare const prisma: PrismaClient;

export { PrismaClient, prisma };
