import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { createAppointmentDto } from './dto/create-appointment.dto.js';
import { updateAppointment } from './dto/update-appointment.dto.js';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { AppointmentStatus, Role } from '../../generated/prisma/enums.js';
import {
  normalizePagination,
  buildPaginationMeta,
} from '../common/pagination/pagination.js';
import { DateTime } from 'luxon';
import { countPendingAppointmentsRes, doctorOverviewRes } from '@hap/contract';

//TODO: Connect payment gatway via axios call

@Injectable()
export class appointmentService {
  constructor(private prisma: DatabaseService) {}

  async createAppointment(dto: createAppointmentDto, session: UserSession) {
    const { slotId } = dto;
    const slot = await this.prisma.slot.findUnique({
      where: { id: slotId, status: 'available' },
      include: {
        Schedule: {
          include: {
            Hospital: { select: { id: true, fee: true, subAccountId: true } },
          },
        },
      },
    });
    if (!slot)
      throw new NotFoundException(
        'A valid slot was not found for the schedule',
      );
    // const tx_ref = await this.chapa.generateTransactionReference();
    // const chapaResponse = await this.chapa.initialize({
    //   first_name: session.user.name,
    //   last_name: session.user.name,
    //   email: session.user.email,
    //   currency: 'ETB',
    //   amount: slot.schedule.hospital.fee.toString(),
    //   tx_ref,
    //   customization: {
    //     title: 'Test title',
    //     description: 'Test description',
    //   },
    //   subaccounts: [
    //     {
    //       id: slot.schedule.hospital.subAccountId,
    //     },
    //   ],
    // });
    // await this.prisma.slot.update({
    //   where: { id: slotId },
    //   data: { status: 'booked' },
    // });
    // await this.prisma.appointment.create({
    //   data: {
    //     customerId: session.user.id,
    //     doctorId: slot.schedule.doctorId,
    //     hospitalId: slot.schedule.hospitalId,
    //     slotId: slot.id,
    //     scheduleId: slot.scheduleId,
    //     approvedSlotStart: slot.slotStart,
    //     approvedSlotEnd: slot.slotEnd,
    //     tx_ref,
    //     notes: dto.notes,
    //   },
    // });
    // return chapaResponse.data.checkout_url;
  }
  async findOne(id: string, session: UserSession) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        User_Appointment_customerIdToUser: {
          select: { fullName: true, phoneNumber: true },
        },
        Doctor: {
          include: {
            User: { select: { fullName: true } },
          },
        },
        originalSlot: {
          select: { slotStart: true, slotEnd: true, date: true },
        },
        Hospital: {
          select: { name: true },
        },
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    
    const userRole = session.user.role as Role;
    if (userRole === Role.user) {
      if (appointment.customerId !== session.user.id)
        throw new UnauthorizedException('Unauthorized to access the resource');
    } else if (userRole === Role.hospital_operator) {
      const hospitalId = await this.getOperatorHospitalId(session);
      if (appointment.hospitalId !== hospitalId)
        throw new UnauthorizedException('Unauthorized to access the resource');
    }
    return appointment;
  }
  async findAll(session: UserSession, page: number, limit: number) {
    const userRole = session.user.role as Role;
    let whereClause = {};
    if (userRole === 'hospital_admin') {
      const adminId = session.user.id;
      const hospital = await this.prisma.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      whereClause = {
        hospitalId: hospital.id,
      };
    }
    if (userRole === 'hospital_operator') {
      const hospitalId = await this.getOperatorHospitalId(session);
      whereClause = {
        hospitalId,
      };
    }
    if (userRole === 'admin') whereClause = {};
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      {
        page,
        limit,
      },
    );
    const [appointments, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where: whereClause,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.appointment.count({ where: whereClause }),
    ]);
    return {
      appointments,
      meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
    };
  }

  async doctorOverview(session: UserSession): Promise<doctorOverviewRes> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: session.user.id },
      include: {
        User: { select: { fullName: true } },
        DoctorSpecialization: {
          include: { Specialization: { select: { name: true } } },
        },
      },
    });
    if (!doctor) throw new NotFoundException("Couldn't find a doctor");

    const doctorId = doctor.id;
    const appts = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: {
          not: 'pending',
        },
      },
      include: {
        originalSlot: {
          select: { date: true, slotStart: true, slotEnd: true },
        },
        User_Appointment_customerIdToUser: {
          select: { fullName: true, gender: true, dateOfBirth: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const todayIso = DateTime.local().toISODate();
    const today: any[] = [];
    const upcomingMap: Record<string, any[]> = {};
    const past: any[] = [];

    for (const a of appts) {
      const slotDateObj: Date | null =
        ((a as any).originalSlot && (a as any).originalSlot.date) ?? null;
      const date = slotDateObj
        ? DateTime.fromJSDate(slotDateObj).toISODate()
        : null;
      if (!date) continue;
      const start =
        (a as any).originalSlot?.slotStart ?? a.approvedSlotStart ?? '';
      const end =
        (a as any).originalSlot?.slotEnd ?? a.approvedSlotEnd ?? '';
      const customer = (a as any).User_Appointment_customerIdToUser;
      // compute age if dateOfBirth provided
      let age: number | null = null;
      if (customer?.dateOfBirth) {
        try {
          const dob = DateTime.fromISO(customer.dateOfBirth);
          if (dob.isValid)
            age = Math.floor(DateTime.local().diff(dob, 'years').years);
        } catch (e) {
          age = null;
        }
      }
      const item = {
        id: a.id,
        date,
        start,
        end,
        patientName: customer?.fullName ?? 'Unknown',
        patientAge: age,
        patientGender: customer?.gender ?? null,
        reason: a.notes ?? '',
        type: 'In-person',
        status: a.status,
        isNew: false,
      };

      if (date === todayIso) {
        today.push(item);
      } else if (date > todayIso) {
        const label = DateTime.fromISO(date).toFormat('EEEE – LLL dd');
        upcomingMap[label] = upcomingMap[label] || [];
        upcomingMap[label].push(item);
      } else {
        past.push(item);
      }
    }

    const counts = {
      today: today.length,
      upcoming: Object.values(upcomingMap).flat().length,
      completed: past.filter((p) => p.status === 'Completed').length,
      cancelled: past.filter((p) => p.status === 'Cancelled').length,
    };

    const doctorInfo = {
      fullName: doctor?.User?.fullName ?? null,
      specializations: (doctor?.DoctorSpecialization || [])
        .map((d) => d?.Specialization?.name ?? d?.Specialization?.name ?? null)
        .filter(Boolean),
    };

    return {
      message: 'Doctor overview fetched successfully',
      status: 'Success',
      data: {
        doctor: doctorInfo,
        today,
        upcomingByDate: upcomingMap,
        past,
        counts,
      },
    };
  }

  async countPendingHospitalAppointments(
    session: UserSession,
  ): Promise<countPendingAppointmentsRes> {
    const adminId = session.user.id;
    const hospital = await this.prisma.hospital.findUniqueOrThrow({
      where: { adminId },
    });
    const hospitalId = hospital.id;
    const whereClause = {
      hospitalId,
      status: 'pending' as AppointmentStatus,
    };
    const totalAppointments = await this.prisma.appointment.count({
      where: whereClause,
    });
    return {
      message: 'Appointments counted successfully',
      totalAppointments,
    };
  }

  async updateOne(id: string, dto: updateAppointment, session: UserSession) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Schedule not found');
    if (session.user.role === Role.user) {
      if (appointment.customerId !== session.user.id)
        throw new UnauthorizedException('Un authorized to access the resource');
    }
    return await this.prisma.appointment.update({
      where: { id },
      data: dto,
    });
  }

  // Helper method to get operator's hospital ID
  private async getOperatorHospitalId(session: UserSession): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: { OperatorHospitalId: true },
    });
    if (!user?.OperatorHospitalId) {
      throw new UnauthorizedException(
        'Operator is not associated with a hospital',
      );
    }
    return user.OperatorHospitalId;
  }

  // Find all appointments for operator with filters
  async findAllForOperator(
    session: UserSession,
    page: number,
    limit: number,
    filters?: {
      status?: AppointmentStatus | 'ALL';
      source?: string | 'ALL';
      doctorId?: string | 'ALL';
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    },
  ) {
    const hospitalId = await this.getOperatorHospitalId(session);
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      {
        page,
        limit,
      },
    );

    const whereClause: any = {
      hospitalId,
    };

    // Apply filters
    if (filters?.status && filters.status !== 'ALL') {
      whereClause.status = filters.status;
    }

    if (filters?.source && filters.source !== 'ALL') {
      whereClause.source = filters.source.toLowerCase().replace(' ', '_');
    }

    if (filters?.doctorId && filters.doctorId !== 'ALL') {
      whereClause.doctorId = filters.doctorId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.approvedSlotStart = {};
      if (filters.dateFrom) {
        whereClause.approvedSlotStart.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        whereClause.approvedSlotStart.lte = endDate;
      }
    }

    // Search filter (patient name, phone, appointment ID)
    if (filters?.search) {
      const searchTerm = filters.search.trim();
      whereClause.OR = [
        { id: { contains: searchTerm, mode: 'insensitive' } },
        {
          User_Appointment_customerIdToUser: {
            fullName: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        {
          User_Appointment_customerIdToUser: {
            phoneNumber: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ];
    }

    const [appointments, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where: whereClause,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          User_Appointment_customerIdToUser: {
            select: { fullName: true, phoneNumber: true },
          },
          Doctor: {
            include: {
              User: { select: { fullName: true } },
            },
          },
          originalSlot: {
            select: { slotStart: true, slotEnd: true, date: true },
          },
        },
      }),
      this.prisma.appointment.count({ where: whereClause }),
    ]);

    return {
      appointments,
      meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
    };
  }

  // Approve appointment
  async approveAppointment(id: string, session: UserSession) {
    const hospitalId = await this.getOperatorHospitalId(session);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        originalSlot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.hospitalId !== hospitalId) {
      throw new UnauthorizedException(
        'Not authorized to approve this appointment',
      );
    }

    if (appointment.status !== AppointmentStatus.pending) {
      throw new BadRequestException(
        'Only pending appointments can be approved',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update appointment status
      const updated = await tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.approved,
          approvedBy: session.user.id,
        },
      });

      // Update slot status if exists
      if (appointment.originalSlot) {
        await tx.slot.update({
          where: { id: appointment.slotId },
          data: { status: 'booked' },
        });
      }

      return updated;
    });
  }

  // Reschedule appointment
  async rescheduleAppointment(
    id: string,
    newSlotId: string,
    session: UserSession,
  ) {
    const hospitalId = await this.getOperatorHospitalId(session);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        originalSlot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.hospitalId !== hospitalId) {
      throw new UnauthorizedException(
        'Not authorized to reschedule this appointment',
      );
    }

    // Check if new slot exists and is available
    const newSlot = await this.prisma.slot.findUnique({
      where: { id: newSlotId },
      include: {
        Schedule: true,
      },
    });

    if (!newSlot) {
      throw new NotFoundException('New slot not found');
    }

    if (newSlot.status !== 'available') {
      throw new BadRequestException('Selected slot is not available');
    }

    if (newSlot.Schedule.hospitalId !== hospitalId) {
      throw new BadRequestException(
        'New slot must belong to the same hospital',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // Free old slot if exists
      if (appointment.originalSlot) {
        await tx.slot.update({
          where: { id: appointment.slotId },
          data: { status: 'available', appointmentId: null },
        });
      }

      // Book new slot
      await tx.slot.update({
        where: { id: newSlotId },
        data: { status: 'booked', appointmentId: id },
      });

      // Update appointment
      const updated = await tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.rescheduled,
          newScheduleId: newSlot.scheduleId,
          newSlotId: newSlotId,
          approvedSlotStart: newSlot.slotStart,
          approvedSlotEnd: newSlot.slotEnd,
          approvedBy: session.user.id,
        },
      });

      return updated;
    });
  }

  // Refund appointment
  async refundAppointment(id: string, session: UserSession) {
    const hospitalId = await this.getOperatorHospitalId(session);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        originalSlot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.hospitalId !== hospitalId) {
      throw new UnauthorizedException(
        'Not authorized to refund this appointment',
      );
    }

    if (
      appointment.status === AppointmentStatus.refunded ||
      appointment.status === AppointmentStatus.completed
    ) {
      throw new BadRequestException(
        'Cannot refund an already refunded or completed appointment',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update appointment status
      const updated = await tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.refunded,
          approvedBy: session.user.id,
          refundedAt: new Date(),
        },
      });

      // Free slot if exists
      if (appointment.originalSlot) {
        await tx.slot.update({
          where: { id: appointment.slotId },
          data: { status: 'available', appointmentId: null },
        });
      }

      // Update payment status if payment exists
      await tx.payment.updateMany({
        where: { appointmentId: id },
        data: { status: 'refunded' },
      });

      return updated;
    });
  }

  // Get operator KPIs
  async getOperatorKPIs(session: UserSession) {
    const hospitalId = await this.getOperatorHospitalId(session);
    const today = DateTime.local().startOf('day').toJSDate();
    const endOfToday = DateTime.local().endOf('day').toJSDate();

    const [
      pendingCount,
      approvedToday,
      rescheduledToday,
      refundedCount,
      totalToday,
      totalSlots,
      bookedSlots,
    ] = await Promise.all([
      // Pending appointments
      this.prisma.appointment.count({
        where: {
          hospitalId,
          status: AppointmentStatus.pending,
        },
      }),
      // Approved today
      this.prisma.appointment.count({
        where: {
          hospitalId,
          status: AppointmentStatus.approved,
          createdAt: { gte: today, lte: endOfToday },
        },
      }),
      // Rescheduled today
      this.prisma.appointment.count({
        where: {
          hospitalId,
          status: AppointmentStatus.rescheduled,
          updatedAt: { gte: today, lte: endOfToday },
        },
      }),
      // Total refunded
      this.prisma.appointment.count({
        where: {
          hospitalId,
          status: AppointmentStatus.refunded,
        },
      }),
      // Total today
      this.prisma.appointment.count({
        where: {
          hospitalId,
          approvedSlotStart: { gte: today, lte: endOfToday },
        },
      }),
      // Total slots for today (for utilization calculation)
      this.prisma.slot.count({
        where: {
          Schedule: { hospitalId },
          date: { gte: today, lte: endOfToday },
        },
      }),
      // Booked slots for today
      this.prisma.slot.count({
        where: {
          Schedule: { hospitalId },
          date: { gte: today, lte: endOfToday },
          status: 'booked',
        },
      }),
    ]);

    const slotUtilization =
      totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    return {
      pending: pendingCount,
      approvedToday,
      rescheduledToday,
      refunds: refundedCount,
      totalToday,
      slotUtilization,
    };
  }

  // async verifyPayment(data: chapaWebhookPayload, signature: string) {
  //   const secret = process.env.CHAPA_SECRET_HASH!;
  //   const hash = createHmac('sha256', secret)
  //     .update(JSON.stringify(data))
  //     .digest('hex');
  //   if (hash !== signature)
  //     throw new UnauthorizedException('Bad chapa signature');
  //   const { event, tx_ref } = data;
  //   const appointment = await this.prisma.appointment.findUnique({
  //     where: { tx_ref },
  //     include: {
  //       schedule: { include: { hospital: { select: { fee: true } } } },
  //       slot: true,
  //     },
  //   });
  //   if (!appointment)
  //     throw new NotFoundException(
  //       'An appointment was not found with the provided tx_ref',
  //     );
  //   if (event !== 'charge.success') {
  //     await this.prisma.slot.update({
  //       where: { id: appointment.slotId },
  //       data: { status: 'available', appointmentId: null },
  //     });
  //     throw new BadRequestException('Payment failed or cancelled');
  //   }
  //   const verRes = await this.chapa.verify({ tx_ref });
  //   if (
  //     verRes.status !== 'success' ||
  //     verRes.data.amount !==
  //       (Number(appointment.schedule.hospital.fee) + 20).toString() ||
  //     verRes.data.currency !== 'ETB' ||
  //     verRes.data.tx_ref !== appointment.tx_ref
  //   ) {
  //     await this.prisma.slot.update({
  //       where: { id: appointment.slot?.id },
  //       data: { status: 'available', appointmentId: null },
  //     });
  //     throw new BadRequestException('Payment not completed');
  //   }
  //   await this.prisma.appointment.update({
  //     where: { tx_ref },
  //     data: { isPaid: true },
  //   });
  //   return;
  // }
}
