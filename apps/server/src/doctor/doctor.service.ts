import {
  BadRequestException,
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { DateTime } from 'luxon';
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
  doctorsDashboard,
} from '@hap/contract';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly operatorBookedStatuses: AppointmentStatus[] = [
    AppointmentStatus.pending,
    AppointmentStatus.approved,
    AppointmentStatus.rescheduled,
    AppointmentStatus.completed,
  ];

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
      throw new BadGatewayException('Invalid hospitals provided');
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

  private async getOperatorHospitalContext(session: UserSession) {
    const operator = await this.databaseService.user.findUnique({
      where: { id: session.user.id },
      select: {
        OperatorHospitalId: true,
        HospitalOperator: {
          select: {
            timezone: true,
          },
        },
      },
    });
    if (!operator?.OperatorHospitalId) {
      throw new UnauthorizedException(
        'Operator is not associated with a hospital',
      );
    }
    return {
      hospitalId: operator.OperatorHospitalId,
      timezone: operator.HospitalOperator?.timezone ?? 'UTC',
    };
  }

  private normalizeOperatorDate(
    requestedDate: string | undefined,
    timezone: string,
  ): string {
    if (!requestedDate) {
      return DateTime.now().setZone(timezone).toISODate() as string;
    }
    const parsed = DateTime.fromISO(requestedDate, { zone: timezone });
    if (!parsed.isValid) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    return parsed.toISODate() as string;
  }

  private toWeekdayIndex(dateISO: string, timezone: string): number {
    const weekday = DateTime.fromISO(dateISO, { zone: timezone }).weekday;
    return weekday === 7 ? 0 : weekday;
  }

  private normalizeTime(value: string): string {
    if (!value) return '00:00';
    return value.length >= 5 ? value.slice(0, 5) : value;
  }

  private hhmmToMinutes(hhmm: string): number {
    const [h, m] = this.normalizeTime(hhmm)
      .split(':')
      .map((v) => Number(v));
    return (h ?? 0) * 60 + (m ?? 0);
  }

  private minutesToHHmm(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private isScheduleActiveOnDate(
    schedule: {
      dayOfWeek: number[];
      startDate: string | null;
      endDate: string | null;
    },
    dateISO: string,
    weekdayIndex: number,
  ) {
    if (schedule.startDate && dateISO < schedule.startDate) return false;
    if (schedule.endDate && dateISO > schedule.endDate) return false;
    if (schedule.dayOfWeek?.length > 0) {
      return schedule.dayOfWeek.includes(weekdayIndex);
    }
    return true;
  }

  private mergeWorkingHours(
    schedules: {
      dayOfWeek: number[];
      startDate: string | null;
      endDate: string | null;
      startTime: string;
      endTime: string;
    }[],
    dateISO: string,
    weekdayIndex: number,
  ) {
    const applicable = schedules.filter((schedule) =>
      this.isScheduleActiveOnDate(schedule, dateISO, weekdayIndex),
    );
    if (!applicable.length) {
      return {
        isWorking: false,
        start: '00:00',
        end: '00:00',
        label: 'Off',
      };
    }
    const start = applicable
      .map((item) => this.normalizeTime(item.startTime))
      .sort((a, b) => a.localeCompare(b))[0];
    const end = applicable
      .map((item) => this.normalizeTime(item.endTime))
      .sort((a, b) => b.localeCompare(a))[0];
    return {
      isWorking: true,
      start: start ?? '00:00',
      end: end ?? '00:00',
      label: `${start ?? '00:00'}-${end ?? '00:00'}`,
    };
  }

  private buildScheduleSlotTimes(
    schedules: {
      dayOfWeek: number[];
      startDate: string | null;
      endDate: string | null;
      startTime: string;
      endTime: string;
    }[],
    dateISO: string,
    weekdayIndex: number,
    slotDuration: number,
  ): string[] {
    const safeDuration = Number.isFinite(slotDuration) && slotDuration > 0
      ? slotDuration
      : 30;
    const slotStarts = new Set<number>();

    for (const schedule of schedules) {
      if (!this.isScheduleActiveOnDate(schedule, dateISO, weekdayIndex)) continue;

      const startMin = this.hhmmToMinutes(schedule.startTime);
      const endMin = this.hhmmToMinutes(schedule.endTime);
      if (endMin <= startMin) continue;

      for (
        let cursor = startMin;
        cursor + safeDuration <= endMin;
        cursor += safeDuration
      ) {
        slotStarts.add(cursor);
      }
    }

    return Array.from(slotStarts)
      .sort((a, b) => a - b)
      .map((minutes) => this.minutesToHHmm(minutes));
  }

  async getOperatorDoctorsOverview(session: UserSession, requestedDate?: string) {
    const { hospitalId, timezone } =
      await this.getOperatorHospitalContext(session);
    const selectedDateISO = this.normalizeOperatorDate(requestedDate, timezone);

    const selectedDate = DateTime.fromISO(selectedDateISO, {
      zone: timezone,
    }).startOf('day');
    const selectedStartUtc = selectedDate.toUTC().toJSDate();
    const sevenDayEndUtc = selectedDate.plus({ days: 7 }).toUTC().toJSDate();

    const doctorProfiles =
      await this.databaseService.doctorHospitalProfile.findMany({
        where: { hospitalId },
        select: {
          doctorId: true,
          slotDuration: true,
          Doctor: {
            select: {
              id: true,
              isDeactivated: true,
              User: {
                select: {
                  fullName: true,
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

    const doctorIds = doctorProfiles.map((profile) => profile.doctorId);
    if (!doctorIds.length) {
      return {
        status: 'Success',
        message: 'Operator doctors fetched successfully',
        data: {
          date: selectedDateISO,
          doctors: [],
        },
      };
    }

    const [schedules, appointments] = await this.databaseService.$transaction([
      this.databaseService.schedule.findMany({
        where: {
          hospitalId,
          doctorId: { in: doctorIds },
          status: ScheduleStatus.approved,
          isDeactivated: false,
          isExpired: false,
          isDeleted: false,
        },
        select: {
          doctorId: true,
          dayOfWeek: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
        },
      }),
      this.databaseService.appointment.findMany({
        where: {
          hospitalId,
          doctorId: { in: doctorIds },
          approvedSlotStart: {
            gte: selectedStartUtc,
            lt: sevenDayEndUtc,
          },
          status: {
            in: this.operatorBookedStatuses,
          },
        },
        select: {
          id: true,
          doctorId: true,
          status: true,
          approvedSlotStart: true,
          User_Appointment_customerIdToUser: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          approvedSlotStart: 'asc',
        },
      }),
    ]);

    const schedulesByDoctor = new Map<string, typeof schedules>();
    for (const schedule of schedules) {
      const existing = schedulesByDoctor.get(schedule.doctorId) ?? [];
      existing.push(schedule);
      schedulesByDoctor.set(schedule.doctorId, existing);
    }

    const bookedTimesByDoctorDate = new Map<string, Set<string>>();
    const selectedDateAppointmentsByDoctor = new Map<
      string,
      {
        id: string;
        time: string;
        patient: string;
        status:
          | 'PENDING'
          | 'APPROVED'
          | 'RESCHEDULED'
          | 'REFUNDED'
          | 'EXPIRED'
          | 'COMPLETED'
          | 'CANCELLED';
      }[]
    >();

    for (const appointment of appointments) {
      const dayISO = DateTime.fromJSDate(appointment.approvedSlotStart, {
        zone: 'utc',
      })
        .setZone(timezone)
        .toISODate() as string;
      const key = `${appointment.doctorId}:${dayISO}`;
      const time = DateTime.fromJSDate(appointment.approvedSlotStart, {
        zone: 'utc',
      })
        .setZone(timezone)
        .toFormat('HH:mm');
      const times = bookedTimesByDoctorDate.get(key) ?? new Set<string>();
      times.add(time);
      bookedTimesByDoctorDate.set(key, times);

      if (dayISO === selectedDateISO) {
        const timeline = selectedDateAppointmentsByDoctor.get(appointment.doctorId) ?? [];
        timeline.push({
          id: appointment.id,
          time,
          patient:
            appointment.User_Appointment_customerIdToUser?.fullName ??
            'Unknown Patient',
          status: appointment.status.toUpperCase() as
            | 'PENDING'
            | 'APPROVED'
            | 'RESCHEDULED'
            | 'REFUNDED'
            | 'EXPIRED'
            | 'COMPLETED'
            | 'CANCELLED',
        });
        selectedDateAppointmentsByDoctor.set(appointment.doctorId, timeline);
      }
    }

    const todayISO = DateTime.now().setZone(timezone).toISODate() ?? selectedDateISO;
    const nowInHospitalTz = DateTime.now().setZone(timezone);
    const mondayOfSelectedWeek = selectedDate.minus({
      days: selectedDate.weekday - 1,
    });
    const weekRows = [
      { day: 'Monday', offset: 0, weekday: 1 },
      { day: 'Tuesday', offset: 1, weekday: 2 },
      { day: 'Wednesday', offset: 2, weekday: 3 },
      { day: 'Thursday', offset: 3, weekday: 4 },
      { day: 'Friday', offset: 4, weekday: 5 },
      { day: 'Saturday', offset: 5, weekday: 6 },
      { day: 'Sunday', offset: 6, weekday: 0 },
    ];

    const doctors = doctorProfiles.map((profile) => {
      const doctorId = profile.doctorId;
      const doctorSchedules = schedulesByDoctor.get(doctorId) ?? [];
      const selectedWeekday = this.toWeekdayIndex(selectedDateISO, timezone);
      const selectedHours = this.mergeWorkingHours(
        doctorSchedules,
        selectedDateISO,
        selectedWeekday,
      );
      const selectedSlotTimes = this.buildScheduleSlotTimes(
        doctorSchedules,
        selectedDateISO,
        selectedWeekday,
        profile.slotDuration,
      );

      const selectedKey = `${doctorId}:${selectedDateISO}`;
      const selectedBookedTimes = bookedTimesByDoctorDate.get(selectedKey) ?? new Set<string>();
      const totalSlots = selectedSlotTimes.length;
      const bookedSlots = selectedSlotTimes.filter((time) =>
        selectedBookedTimes.has(time),
      ).length;
      const availableSlotTimes = selectedSlotTimes.filter(
        (time) => !selectedBookedTimes.has(time),
      );
      const availableSlots = availableSlotTimes.length;
      const utilizationPct =
        totalSlots === 0 ? 0 : Math.round((bookedSlots / totalSlots) * 100);

      const nextAvailableSlot =
        selectedDateISO < todayISO
          ? null
          : selectedDateISO === todayISO
          ? availableSlotTimes.find((time) => {
              const slotAt = DateTime.fromISO(`${selectedDateISO}T${time}`, {
                zone: timezone,
              });
              return slotAt >= nowInHospitalTz;
            }) ?? null
          : (availableSlotTimes[0] ?? null);

      const next7Days = Array.from({ length: 7 }).map((_, index) => {
        const day = selectedDate.plus({ days: index });
        const dayISO = day.toISODate() as string;
        const dayWeekIndex = this.toWeekdayIndex(dayISO, timezone);
        const dayHours = this.mergeWorkingHours(
          doctorSchedules,
          dayISO,
          dayWeekIndex,
        );
        const key = `${doctorId}:${dayISO}`;
        const slotTimes = this.buildScheduleSlotTimes(
          doctorSchedules,
          dayISO,
          dayWeekIndex,
          profile.slotDuration,
        );
        const bookedTimes = bookedTimesByDoctorDate.get(key) ?? new Set<string>();
        const total = slotTimes.length;
        const booked = slotTimes.filter((time) => bookedTimes.has(time)).length;
        const available = total - booked;
        const utilization =
          total === 0 ? 0 : Math.round((booked / total) * 100);
        return {
          date: dayISO,
          working: dayHours.isWorking,
          totalSlots: total,
          bookedSlots: booked,
          availableSlots: available,
          utilizationPct: utilization,
        };
      });

      const weeklySchedule = weekRows.map((row) => {
        const dateISO = mondayOfSelectedWeek
          .plus({ days: row.offset })
          .toISODate() as string;
        const hours = this.mergeWorkingHours(
          doctorSchedules,
          dateISO,
          row.weekday,
        );
        return {
          day: row.day,
          isWorking: hours.isWorking,
          start: hours.start,
          end: hours.end,
        };
      });

      const specializations = profile.Doctor.DoctorSpecialization.map(
        (item) => item.Specialization.name,
      );

      return {
        id: doctorId,
        name: profile.Doctor.User.fullName,
        specialty: specializations[0] ?? 'General Medicine',
        specializations,
        status: profile.Doctor.isDeactivated ? 'ON_LEAVE' : 'ACTIVE',
        slotDuration: profile.slotDuration,
        weeklySchedule,
        selectedDate: {
          date: selectedDateISO,
          startTime:
            profile.Doctor.isDeactivated || !selectedHours.isWorking
              ? null
              : selectedHours.start,
          endTime:
            profile.Doctor.isDeactivated || !selectedHours.isWorking
              ? null
              : selectedHours.end,
          workingHoursLabel: profile.Doctor.isDeactivated
            ? 'On leave'
            : selectedHours.label,
          totalSlots: profile.Doctor.isDeactivated ? 0 : totalSlots,
          bookedSlots: profile.Doctor.isDeactivated ? 0 : bookedSlots,
          availableSlots: profile.Doctor.isDeactivated ? 0 : availableSlots,
          utilizationPct: profile.Doctor.isDeactivated ? 0 : utilizationPct,
          nextAvailableSlot: profile.Doctor.isDeactivated ? null : nextAvailableSlot,
          appointments:
            selectedDateAppointmentsByDoctor.get(doctorId)?.sort((a, b) =>
              a.time.localeCompare(b.time),
            ) ?? [],
        },
        next7Days: profile.Doctor.isDeactivated
          ? next7Days.map((day) => ({
              ...day,
              working: false,
              totalSlots: 0,
              bookedSlots: 0,
              availableSlots: 0,
              utilizationPct: 0,
            }))
          : next7Days,
      };
    });

    return {
      status: 'Success',
      message: 'Operator doctors fetched successfully',
      data: {
        date: selectedDateISO,
        doctors,
      },
    };
  }

  async doctorDashboard(session: UserSession): Promise<doctorsDashboard> {
    const userId = session.user.id;
    const doctor = await this.databaseService.doctor.findUniqueOrThrow({
      where: { userId },
      include: { User: { select: { fullName: true } } },
    });
    const doctorId = doctor.id;
    const doctorName = doctor.User?.fullName ?? null;

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
          status: { notIn: ['cancelled', 'expired'] },
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
          status: { notIn: ['cancelled', 'expired'] },
        },
        select: { id: true, status: true, approvedSlotStart: true },
      });

      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const completedSeries = Array(7).fill(0);
      const canceledSeries = Array(7).fill(0);

      for (const ap of weekAppointments) {
        const d = new Date(ap.approvedSlotStart);
        const idx = (d.getDay() + 6) % 7; // Monday = 0
        if (ap.status === AppointmentStatus.completed) {
          completedSeries[idx]++;
        } else if (ap.status === AppointmentStatus.cancelled) {
          canceledSeries[idx]++;
        }
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
        where: {
          doctorId,
          status: ScheduleStatus.pending,
          isDeactivated: false,
          isDeleted: false,
          isExpired: false,
        },
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
          doctor: { fullName: doctorName },
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
