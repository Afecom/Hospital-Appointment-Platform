import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { approveDoctor } from './dto/approve-doctor.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { applyDoctorDto } from './dto/apply-doctor.dto.js';
import { rejectDoctor } from './dto/reject-doctor.dto.js';
import { DoctorApplicationStatus } from '@repo/database';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../common/pagination/pagination.js';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const doctors = await this.databaseService.doctor.findMany({
      include: { DoctorSpecialization: true },
    });
    if (doctors.length === 0)
      throw new NotFoundException("Couldn't find any doctors");
    return doctors;
  }

  async findOne(id: string) {
    return await this.databaseService.doctor.findUniqueOrThrow({
      where: { id },
      include: { DoctorSpecialization: true },
    });
  }

  async update(id: string, dto: UpdateDoctorDto) {
    if (dto.specializationIds && dto.specializationIds.length !== 0) {
      const existingSpecialities =
        await this.databaseService.doctorSpecialization.findMany({
          where: { doctorId: id },
          include: { Specialization: true },
        });
      const existingspecIds = existingSpecialities.map(
        (s) => s.specializationId,
      );
      const toDelete = existingspecIds.filter(
        (s) => !dto.specializationIds?.includes(s),
      );
      await this.databaseService.doctorSpecialization.deleteMany({
        where: {
          doctorId: id,
          specializationId: { in: toDelete },
        },
      });
      for (const spec of dto.specializationIds) {
        await this.databaseService.doctorSpecialization.upsert({
          where: {
            doctorId_specializationId: {
              doctorId: id,
              specializationId: spec,
            },
          },
          update: {},
          create: {
            doctorId: id,
            specializationId: spec,
          },
        });
      }
    }
    delete dto.specializationIds;
    return await this.databaseService.doctor.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return await this.databaseService.doctor.delete({ where: { id } });
  }

  async applyDoctor(data: applyDoctorDto, session: UserSession) {
    return await this.databaseService.doctorApplication.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });
  }

  async approveDoctor(data: approveDoctor) {
    const application = await this.databaseService.doctorApplication.findUnique(
      { where: { id: data.applicationId } },
    );
    if (!application)
      throw new NotFoundException(
        'A doctor application was not found with the provided ID',
      );
    return await this.databaseService.$transaction(async (tx) => {
      let doctorProfile = await tx.doctor.findUnique({
        where: { userId: application.userId },
      });
      if (!doctorProfile) {
        doctorProfile = await tx.doctor.create({
          data: {
            userId: application.userId,
            bio: application.bio,
            yearsOfExperience: application.yearsOfExperience,
          },
        });
      }
      await tx.user.update({
        where: { id: doctorProfile.userId },
        data: { role: 'doctor' },
      });
      for (const spec of application.specializationIds) {
        await tx.doctorSpecialization.upsert({
          where: {
            doctorId_specializationId: {
              doctorId: doctorProfile.id,
              specializationId: spec,
            },
          },
          update: {},
          create: {
            doctorId: doctorProfile.id,
            specializationId: spec,
          },
        });
      }
      await tx.doctorHospitalProfile.create({
        data: {
          doctorId: doctorProfile.id,
          hospitalId: application.hospitalId,
          doctorType: data.doctorType,
          slotDuration: data.slotDuration,
        },
      });
      await tx.doctorApplication.update({
        where: { id: data.applicationId },
        data: { status: 'approved' },
      });
    });
  }

  async rejectDoctor(data: rejectDoctor) {
    return await this.databaseService.doctorApplication.update({
      where: { id: data.applicationId },
      data: { status: 'rejected' },
    });
  }

  async getPendingDoctors(session: UserSession, page: number, limit: number) {
    const adminId = session.user.id;
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    return await this.databaseService.$transaction(async (tx) => {
      const hospital = await tx.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const hospitalId = hospital.id;
      const whereClause = {
        hospitalId,
        status: 'pending' as DoctorApplicationStatus,
      };
      let pendingDoctors: any = await tx.doctorApplication.findMany({
        where: whereClause,
        include: { User: true },
        skip,
        take,
      });
      let total = await tx.doctorApplication.count({
        where: whereClause,
      });
      if (pendingDoctors.length === 0) {
        pendingDoctors = {};
        total = 0;
      }
      return {
        pendingDoctors,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    });
  }

  async getHospitalDoctors(session: UserSession, page: number, limit: number) {
    const adminId = session.user.id;
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    return await this.databaseService.$transaction(async (tx) => {
      const hospital = await tx.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const hospitalId = hospital.id;
      const doctors = await tx.doctorHospitalProfile.findMany({
        where: { hospitalId },
        include: {
          Doctor: {
            include: {
              User: {
                select: {
                  fullName: true,
                  imageUrl: true,
                  phoneNumber: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take,
      });
      const total = await tx.doctorHospitalProfile.count({
        where: { hospitalId },
      });
      return {
        doctors,
        hospital,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    });
  }
  async getInactiveHospitalDoctors(
    session: UserSession,
    page: number,
    limit: number,
  ) {
    const adminId = session.user.id;
    const { skip, take, normalizedLimit, normalizedPage } = normalizePagination(
      { page, limit },
    );
    return await this.databaseService.$transaction(async (tx) => {
      const hospital = await tx.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const hospitalId = hospital.id;
      const whereClause = {
        hospitalId,
        doctor: { schedules: { none: {} } },
      };
      const inactiveDoctors = await tx.doctorHospitalProfile.findMany({
        where: whereClause,
        include: {
          Doctor: { include: { User: true } },
        },
        skip,
        take,
      });
      const total = await tx.doctorHospitalProfile.count({
        where: whereClause,
      });
      return {
        inactiveDoctors,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    });
  }
}
