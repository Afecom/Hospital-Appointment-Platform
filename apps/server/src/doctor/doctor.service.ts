import { Injectable, NotFoundException } from '@nestjs/common';
import {
  approveDoctor,
  rejectDoctor,
} from './dto/approve-reject-doctor.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { applyHospitalDoctorDto } from './dto/apply-hospital-doctor.dto.js';
import {
  AppointmentStatus,
  DoctorHospitalApplicationStatus,
  ScheduleStatus,
} from '../../generated/prisma/enums.js';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../common/pagination/pagination.js';
import { applyDoctor } from './dto/apply-doctor.dto.js';
import {
  approveHospitalDoctor,
  doctorHospitalApplication,
} from './dto/approve-reject-hospital-doctor.dto.js';
import {
  countHospitalDoctorsRes,
  countPendingDoctorsRes,
  getHospitalDoctorsRes,
  inactiveHospitalDoctorsRes,
  removeDoctorFromHospitalRes,
} from '@hap/contract';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(page: number, limit: number) {
    const { normalizedLimit, normalizedPage, skip, take } = normalizePagination(
      { page, limit },
    );
    return await this.databaseService.$transaction(async (tx) => {
      const doctors = await tx.doctor.findMany({
        skip,
        take,
      });

      const total = await tx.doctor.count();
      return {
        message: 'Doctors fetched successfully',
        status: 'success',
        data: {
          doctors,
          meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
        },
      };
    });
  }

  async findOne(id: string) {
    return await this.databaseService.doctor.findUniqueOrThrow({
      where: { id },
      include: { DoctorSpecialization: true },
    });
  }

  // async update(id: string, dto: UpdateDoctorDto) {
  //   if (dto.specializationIds && dto.specializationIds.length !== 0) {
  //     const existingSpecialities =
  //       await this.databaseService.doctorSpecialization.findMany({
  //         where: { doctorId: id },
  //         include: { Specialization: true },
  //       });
  //     const existingspecIds = existingSpecialities.map(
  //       (s) => s.specializationId,
  //     );
  //     const toDelete = existingspecIds.filter(
  //       (s) => !dto.specializationIds?.includes(s),
  //     );
  //     await this.databaseService.doctorSpecialization.deleteMany({
  //       where: {
  //         doctorId: id,
  //         specializationId: { in: toDelete },
  //       },
  //     });
  //     for (const spec of dto.specializationIds) {
  //       await this.databaseService.doctorSpecialization.upsert({
  //         where: {
  //           doctorId_specializationId: {
  //             doctorId: id,
  //             specializationId: spec,
  //           },
  //         },
  //         update: {},
  //         create: {
  //           doctorId: id,
  //           specializationId: spec,
  //         },
  //       });
  //     }
  //   }
  //   delete dto.specializationIds;
  //   return await this.databaseService.doctor.update({
  //     where: { id },
  //     data: dto,
  //   });
  // }

  async removeDoctorFromHospital(
    doctorId: string,
    session: UserSession,
  ): Promise<removeDoctorFromHospitalRes> {
    const adminId = session.user.id;
    const hospital = await this.databaseService.hospital.findUniqueOrThrow({
      where: { adminId },
    });
    const hospitalId = hospital.id;
    const hospitalDoctor =
      await this.databaseService.doctorHospitalProfile.findUniqueOrThrow({
        where: {
          doctorId_hospitalId: {
            doctorId,
            hospitalId,
          },
        },
      });
    // we got to check if the doctor has an active appointment
    const appointment = await this.databaseService.appointment.findFirst({
      where: {
        doctorId: hospitalDoctor.doctorId,
        hospitalId: hospitalDoctor.hospitalId,
        status: {
          in: ['pending', 'approved'],
        },
      },
    });
    if (appointment)
      throw new Error('Doctor has an a pendinc or an approved appointment');
    return await this.databaseService.$transaction(async (tx) => {
      try {
        await tx.schedule.updateMany({
          where: {
            doctorId: hospitalDoctor.doctorId,
            hospitalId: hospitalDoctor.hospitalId,
          },
          data: {
            isDeactivated: true,
          },
        });
        await tx.doctorHospitalProfile.delete({
          where: { id: hospitalDoctor.id },
        });
      } catch (error) {
        throw new Error('Error removing doctor from hospital');
      }
      return {
        message: 'Doctor removed from hospital successfully',
        status: 'Success',
      };
    });
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
      return Promise.all(
        hospitalIds.map(async (hospitalId) => {
          return tx.doctorHospitalApplication.create({
            data: {
              doctorId: doctorProfile.id,
              hospitalId,
            },
          });
        }),
      );
    });
  }

  async approveHospitalDoctor(dto: approveHospitalDoctor) {
    const { applicationId, slotDuration } = dto;
    return await this.databaseService.$transaction(async (tx) => {
      try {
        const application =
          await tx.doctorHospitalApplication.findUniqueOrThrow({
            where: { id: applicationId },
          });
        await tx.doctorHospitalApplication.update({
          where: { id: application.id },
          data: {
            status: 'approved',
          },
        });
        const profile = await tx.doctorHospitalProfile.create({
          data: {
            doctorId: application.doctorId,
            hospitalId: application.hospitalId,
            slotDuration,
          },
        });
        return {
          message: 'Hospital doctor approved successfully',
          status: 'success',
          data: { profile },
        };
      } catch (error) {
        throw new Error('Error approving hospital doctor');
      }
    });
  }

  async getHospitalDoctorApplications(
    session: UserSession,
    status: 'approved' | 'rejected' | 'pending',
    page: number,
    limit: number,
  ) {
    const adminId = session.user.id;
    const hospital = await this.databaseService.hospital.findUniqueOrThrow({
      where: { adminId },
    });
    const hospitalId = hospital.id;
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    return await this.databaseService.$transaction(async (tx) => {
      try {
        const Applications = await tx.doctorHospitalApplication.findMany({
          where: {
            hospitalId,
            status,
          },
          include: {
            Doctor: {
              include: {
                User: {
                  select: {
                    fullName: true,
                    phoneNumber: true,
                    imageUrl: true,
                    gender: true,
                  },
                },
                DoctorSpecialization: {
                  select: {
                    Specialization: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          skip,
          take,
        });
        const total = await tx.doctorHospitalApplication.count({
          where: {
            status,
          },
        });
        return {
          message: `${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending'} hospital doctors fetched successfully`,
          status: 'success',
          data: {
            Applications,
            meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
          },
        };
      } catch (error) {
        throw new Error('Error fetching approved hospital doctors');
      }
    });
  }

  async rejectHospitalDoctor(dto: doctorHospitalApplication) {
    const application =
      await this.databaseService.doctorHospitalApplication.findUniqueOrThrow({
        where: { id: dto.applicationId },
      });
    const rejectedDoctor =
      await this.databaseService.doctorHospitalApplication.update({
        where: { id: application.id },
        data: { status: 'rejected' },
      });
    return {
      status: 'Success',
      message: 'Doctor rejected successfuly',
      data: {
        rejectedDoctor,
      },
    };
  }

  async getRejectedHospitalDoctor(page: number, limit: number) {
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    return await this.databaseService.$transaction(async (tx) => {
      try {
        const rejectedApplications =
          await tx.doctorHospitalApplication.findMany({
            where: {
              status: 'rejected',
            },
            skip,
            take,
          });
        const total = await tx.doctorHospitalApplication.count({
          where: {
            status: 'rejected',
          },
        });
        return {
          message: 'Rejected hospital doctors fetched successfully',
          status: 'success',
          data: {
            rejectedApplications,
            meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
          },
        };
      } catch (error) {
        throw new Error('Error fetching rejected hospital doctors');
      }
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
    return await this.databaseService.$transaction(async (tx) => {
      const doctorApplication = await tx.doctorApplication.findUniqueOrThrow({
        where: { id: data.applicationId },
      });
      const specializationIds = doctorApplication.specializationIds;
      await tx.doctorApplication.update({
        where: { id: doctorApplication.id },
        data: { status: 'approved' },
      });
      const doctor = await tx.doctor.create({
        data: {
          userId: doctorApplication.userId,
          bio: doctorApplication.bio,
          yearsOfExperience: doctorApplication.yearsOfExperience,
          DoctorSpecialization: {
            create: specializationIds.map((id) => ({
              specializationId: id,
            })),
          },
        },
      });
      await tx.user.update({
        where: { id: doctorApplication.userId },
        data: { role: 'doctor' },
      });
      return {
        message: 'Doctor approved successfully',
        status: 'success',
        data: { doctor },
      };
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

  async getPendingDoctors(page: number, limit: number) {
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    return await this.databaseService.$transaction(async (tx) => {
      const pendingDoctors = await tx.doctorApplication.findMany({
        where: { status: 'pending' },
        take,
        skip,
      });
      const total = await tx.doctorApplication.count({
        where: { status: 'pending' },
      });
      return {
        message: 'Pending doctors fetched successfuly',
        status: 'success',
        data: {
          pendingDoctors,
          meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
        },
      };
    });
  }

  async getPendingHospitalDoctors(
    session: UserSession,
    page: number,
    limit: number,
  ) {
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
        status: 'pending' as DoctorHospitalApplicationStatus,
      };
      const pendingHospitalDoctors =
        await tx.doctorHospitalApplication.findMany({
          where: whereClause,
          include: {
            Doctor: {
              include: {
                User: {
                  select: {
                    fullName: true,
                    phoneNumber: true,
                    imageUrl: true,
                    gender: true,
                  },
                },
                DoctorSpecialization: {
                  select: {
                    Specialization: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      const total = await tx.doctorHospitalApplication.count({
        where: whereClause,
      });
      return {
        pendingHospitalDoctors,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    });
  }

  async countPendingHospitalDoctors(
    session: UserSession,
  ): Promise<countPendingDoctorsRes> {
    return await this.databaseService.$transaction(async (tx) => {
      const adminId = session.user.id;
      const hospital = await tx.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const hospitalId = hospital.id;
      const pendingDoctors = await tx.doctorHospitalApplication.count({
        where: {
          hospitalId,
          status: 'pending',
        },
      });
      return {
        message: 'Pending hospital doctors counted successfully',
        pendingDoctors,
      };
    });
  }
  async getHospitalDoctors(
    session: UserSession,
    page: number,
    limit: number,
  ): Promise<getHospitalDoctorsRes> {
    const adminId = session.user.id;
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    const hospital = await this.databaseService.hospital.findUniqueOrThrow({
      where: { adminId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
      },
    });
    const hospitalId = hospital.id;
    const doctors = await this.databaseService.doctorHospitalProfile.findMany({
      where: { hospitalId },
      select: {
        id: true,
        slotDuration: true,
        Doctor: {
          select: {
            id: true,
            yearsOfExperience: true,
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
    const total = await this.databaseService.doctorHospitalProfile.count({
      where: { hospitalId },
    });
    return {
      message: 'Hospital doctors fetched successfully',
      status: 'Success',
      data: {
        doctors,
        hospital,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      },
    };
  }
  async getInactiveHospitalDoctors(
    session: UserSession,
    page: number,
    limit: number,
  ): Promise<inactiveHospitalDoctorsRes> {
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
        Doctor: {
          Schedule: {
            none: {
              hospitalId,
            },
          },
        },
      };
      const inactiveDoctors = await tx.doctorHospitalProfile.findMany({
        where: whereClause,
        select: {
          id: true,
          slotDuration: true,
          Doctor: {
            select: {
              id: true,
              User: {
                select: {
                  id: true,
                  fullName: true,
                  phoneNumber: true,
                },
              },
            },
          },
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

  async countHospitalDoctors(
    session: UserSession,
  ): Promise<countHospitalDoctorsRes> {
    const adminId = session.user.id;
    const hospital = await this.databaseService.hospital.findUniqueOrThrow({
      where: { adminId },
    });
    const hospitalId = hospital.id;
    const total = await this.databaseService.doctorHospitalProfile.count({
      where: { hospitalId },
    });
    return {
      status: 'Success',
      message: 'Doctors counted successfuly',
      total,
    };
  }

  async doctorDashboard(session: UserSession) {
    const userId = session.user.id;
    const doctor = await this.databaseService.doctor.findUniqueOrThrow({
      where: { userId },
    });
    const doctorId = doctor.id;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    // Monday based week
    const day = now.getDay();
    const daysSinceMonday = (day + 6) % 7;
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return await this.databaseService.$transaction(async (tx) => {
      // Today's Appointments
      const todayAppointments = await tx.appointment.findMany({
        where: {
          doctorId,
          approvedSlotStart: { gte: startOfToday, lt: endOfToday },
        },
        orderBy: { approvedSlotStart: 'asc' },
        include: {
          User_Appointment_customerIdToUser: { select: { fullName: true } },
        },
      });

      const todayCount = todayAppointments.length;
      const nextAppointment =
        todayAppointments.find((a) => new Date(a.approvedSlotStart) > now) ||
        null;
      const nextAppointmentAt = nextAppointment
        ? new Date(nextAppointment.approvedSlotStart).toISOString()
        : null;

      // Active Schedules
      const todayStr = startOfToday.toISOString().slice(0, 10);
      const activeSchedules = await tx.schedule.findMany({
        where: {
          doctorId,
          isDeactivated: false,
          isExpired: false,
          isDeleted: false,
          status: ScheduleStatus.approved,
          startDate: { lte: todayStr },
          OR: [{ endDate: null }, { endDate: { gte: todayStr } }],
        },
        orderBy: { startDate: 'asc' },
      });

      const activeSchedulesCount = activeSchedules.length;
      const nextActiveDate = activeSchedules.length
        ? activeSchedules[0].startDate
        : null;

      // Pending hospital applications for this doctor
      const pendingHospitalApplications =
        await tx.doctorHospitalApplication.count({
          where: { doctorId, status: DoctorHospitalApplicationStatus.pending },
        });

      // Appointments this week grouped by day
      const weekAppointments = await tx.appointment.findMany({
        where: {
          doctorId,
          approvedSlotStart: { gte: startOfWeek, lt: endOfWeek },
        },
        select: { id: true, status: true, approvedSlotStart: true },
      });

      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const completedSeries = Array(7).fill(0);
      const canceledSeries = Array(7).fill(0);

      for (const ap of weekAppointments) {
        const d = new Date(ap.approvedSlotStart);
        const idx = (d.getDay() + 6) % 7; // Monday = 0
        if (ap.status === AppointmentStatus.completed) completedSeries[idx]++;
        else if (
          ap.status === AppointmentStatus.cancelled ||
          ap.status === AppointmentStatus.rejected
        )
          canceledSeries[idx]++;
      }

      const completedTotal = completedSeries.reduce((s, v) => s + v, 0);
      const canceledTotal = canceledSeries.reduce((s, v) => s + v, 0);

      // previous week completed count for trend
      const prevStart = new Date(startOfWeek);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(startOfWeek);

      const prevCompleted = await tx.appointment.count({
        where: {
          doctorId,
          status: AppointmentStatus.completed,
          approvedSlotStart: { gte: prevStart, lt: prevEnd },
        },
      });

      const trend = prevCompleted
        ? Math.round(((completedTotal - prevCompleted) / prevCompleted) * 100)
        : 0;

      // Slots utilization for the week
      const totalSlots = await tx.slot.count({
        where: {
          date: { gte: startOfWeek, lt: endOfWeek },
          Schedule: { doctorId },
        },
      });
      const bookedSlots = await tx.slot.count({
        where: {
          date: { gte: startOfWeek, lt: endOfWeek },
          Schedule: { doctorId },
          appointmentId: { not: null },
        },
      });
      const utilizationPercent = totalSlots
        ? Math.round((bookedSlots / totalSlots) * 100)
        : 0;

      // patient load
      const avgPerDay = +(weekAppointments.length / 7).toFixed(1);
      const peakIdx = completedSeries.indexOf(Math.max(...completedSeries));
      const peakDay = labels[peakIdx] || 'N/A';
      const peakCount = completedSeries[peakIdx] || 0;

      // Recent activities (appointments, schedules, applications)
      const recentAppointments = await tx.appointment.findMany({
        where: { doctorId },
        include: {
          User_Appointment_customerIdToUser: { select: { fullName: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      });

      const recentSchedules = await tx.schedule.findMany({
        where: { doctorId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      const recentApplications = await tx.doctorHospitalApplication.findMany({
        where: { doctorId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      // Pending schedules for the doctor (for conditional card display)
      const pendingSchedulesCount = await tx.schedule.count({
        where: { doctorId, status: ScheduleStatus.pending },
      });

      // Active hospitals the doctor is attached to
      const activeHospitalCount = await tx.doctorHospitalProfile.count({
        where: { doctorId },
      });

      type Activity = {
        type: string;
        ts: Date;
        entity?: string;
        status?: string;
      };
      const activities: Activity[] = [];

      for (const a of recentAppointments) {
        activities.push({
          type:
            a.status === AppointmentStatus.cancelled
              ? 'Appointment canceled'
              : 'Appointment booked',
          ts: a.updatedAt || a.createdAt,
          entity: a.User_Appointment_customerIdToUser?.fullName
            ? `Patient: ${a.User_Appointment_customerIdToUser.fullName}`
            : 'Patient',
          status: a.status,
        });
      }

      for (const s of recentSchedules) {
        const t = s.isDeactivated
          ? 'Schedule deactivated'
          : s.status === ScheduleStatus.approved
            ? 'Schedule approved'
            : 'Schedule submitted';
        activities.push({
          type: t,
          ts: s.updatedAt,
          entity: s.name,
          status: s.status,
        });
      }

      for (const app of recentApplications) {
        activities.push({
          type:
            app.status === 'pending'
              ? 'Schedule submitted'
              : 'Application update',
          ts: app.updatedAt,
          entity: 'Hospital Application',
          status: app.status,
        });
      }

      activities.sort((a, b) => b.ts.getTime() - a.ts.getTime());

      return {
        status: 'Success',
        message: 'Doctor dashboard data fetched successfully',
        data: {
          critical: {
            todaysAppointments: {
              count: todayCount,
              nextAt: nextAppointmentAt,
            },
            activeSchedules: { count: activeSchedulesCount, nextActiveDate },
            pendingSchedules: { count: pendingSchedulesCount },
            pendingHospitalApplications: { count: pendingHospitalApplications },
            activeHospitals: { count: activeHospitalCount },
          },
          weekly: {
            labels,
            completedSeries,
            canceledSeries,
            completed: completedTotal,
            canceled: canceledTotal,
            trend,
          },
          patientLoad: { avgPerDay, peakDay, peakCount },
          utilization: {
            percent: utilizationPercent,
            booked: bookedSlots,
            total: totalSlots,
          },
          recentActivities: activities.slice(0, 10).map((a) => ({
            action: a.type,
            ts: a.ts,
            entity: a.entity,
            status: a.status,
          })),
        },
      };
    });
  }
}
