import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import {
  approveDoctor,
  rejectDoctor,
} from './dto/approve-reject-doctor.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { applyHospitalDoctorDto } from './dto/apply-hospital-doctor.dto.js';
import { DoctorApplicationStatus } from '../../generated/prisma/enums.js';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../common/pagination/pagination.js';
import { applyDoctor } from './dto/apply-doctor.dto.js';
import {
  approveHospitalDoctor,
  rejectHospitalDoctor,
} from './dto/approve-reject-hospital-doctor.dto.js';

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

  async applyHospitalDoctor(dto: applyHospitalDoctorDto, session: UserSession) {
    const userId = session.user.id;
    const { hospitalIds } = dto;
    const doctorProfile = await this.databaseService.doctor.findUniqueOrThrow({
      where: { userId },
    });
    const hospitals = await this.databaseService.hospital.findMany({
      where: { id: { in: hospitalIds } },
    });
    if (hospitals.length !== hospitalIds.length)
      throw new Error('Invalid hospital ids');
    return await this.databaseService.$transaction(async (tx) => {
      hospitalIds.map(async (hospitalId) => {
        return await tx.doctorHospitalApplication.create({
          data: {
            doctorId: doctorProfile.id,
            hospitalId,
          },
        });
      });
    });
  }

  async approveHospitalDoctor(dto: approveHospitalDoctor) {
    const { applicationId, ...rest } = dto;
    const application =
      await this.databaseService.doctorHospitalApplication.findUniqueOrThrow({
        where: { id: applicationId },
      });
    return await this.databaseService.doctorHospitalApplication.update({
      where: { id: application.id },
      data: {
        ...rest,
        status: 'approved',
      },
    });
  }
  async rejectHospitalDoctor(dto: rejectHospitalDoctor) {
    const application =
      await this.databaseService.doctorHospitalApplication.findUniqueOrThrow({
        where: { id: dto.applicationId },
      });
    return await this.databaseService.doctorHospitalApplication.update({
      where: { id: application.id },
      data: { status: 'rejected' },
    });
  }

  async applyDoctor(dto: applyDoctor, session: UserSession) {
    return await this.databaseService.doctorApplication.create({
      data: {
        userId: session.user.id,
        ...dto,
      },
    });
  }

  async approveDoctor(data: approveDoctor) {
    const doctorApplication =
      await this.databaseService.doctorApplication.findUniqueOrThrow({
        where: { id: data.applicationId },
      });
    return await this.databaseService.doctorApplication.update({
      where: { id: doctorApplication.id },
      data: { status: 'approved' },
    });
  }

  async rejectDoctor(data: rejectDoctor) {
    const doctorApplication =
      await this.databaseService.doctorApplication.findUniqueOrThrow({
        where: { id: data.applicationId },
      });

    return await this.databaseService.doctorApplication.update({
      where: { id: doctorApplication.id },
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
        select: {
          id: true,
          yearsOfExperience: true,
          specializationIds: true,
          User: {
            select: {
              fullName: true,
              gender: true,
              phoneNumber: true,
            },
          },
          DoctorApplicationSpecialization: {
            select: {
              Specialization: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
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

  async countPendingDoctors(session: UserSession) {
    return await this.databaseService.$transaction(async (tx) => {
      const adminId = session.user.id;
      const hospital = await tx.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const hospitalId = hospital.id;
      const pendingDoctors = await tx.doctorApplication.count({
        where: {
          hospitalId,
          status: 'pending',
        },
      });
      return pendingDoctors;
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
        Doctor: { Schedule: { none: {} } },
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

  async countHospitalDoctors(session: UserSession) {
    return await this.databaseService.$transaction(async (tx) => {
      const adminId = session.user.id;
      const hospital = await tx.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const hospitalId = hospital.id;
      const total = await tx.doctorHospitalProfile.count({
        where: { hospitalId },
      });
      return total;
    });
  }
}
