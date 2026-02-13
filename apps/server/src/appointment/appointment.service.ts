import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { countPendingAppointmentsRes } from '@hap/contract/main.js';

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
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (session.user.role === Role.user) {
      if (appointment.customerId !== session.user.id)
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
      this.prisma.appointment.count(),
    ]);
    return {
      appointments,
      meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
    };
  }

  async doctorOverview(session: UserSession) {
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
      where: { doctorId },
      include: {
        Slot: { select: { date: true, slotStart: true, slotEnd: true } },
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
      const slotDateObj: Date | null = (a.Slot && (a.Slot as any).date) ?? null;
      const date = slotDateObj
        ? DateTime.fromJSDate(slotDateObj).toISODate()
        : null;
      if (!date) continue;
      const start = a.Slot?.slotStart ?? a.approvedSlotStart ?? '';
      const end = a.Slot?.slotEnd ?? a.approvedSlotEnd ?? '';
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
      fullName: doctor.User?.fullName ?? null,
      specializations: (doctor.DoctorSpecialization || [])
        .map((d) => d.Specialization?.name)
        .filter(Boolean),
    };

    return {
      doctor: doctorInfo,
      today,
      upcomingByDate: upcomingMap,
      past,
      counts,
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
