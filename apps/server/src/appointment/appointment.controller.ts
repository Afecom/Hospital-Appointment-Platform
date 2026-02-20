import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { Session, type UserSession, Roles } from '@thallesp/nestjs-better-auth';
import { createAppointmentDto } from './dto/create-appointment.dto.js';
import { appointmentService } from './appointment.service.js';
import { Role } from '../../generated/prisma/enums.js';
import { updateAppointment } from './dto/update-appointment.dto.js';

//TODO: SETUP A WEBHOOK FOR CHAPA

@Controller('appointment')
export class appointmentController {
  constructor(private appointment: appointmentService) {}

  @Post()
  @Roles([Role.user, Role.admin, Role.hospital_operator])
  create(@Body() data: createAppointmentDto, @Session() session: UserSession) {
    return this.appointment.createAppointment(data, session);
  }

  @Get()
  @Roles([Role.hospital_admin, Role.admin, Role.hospital_operator])
  findall(
    @Session() session: UserSession,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.appointment.findAll(session, page, limit);
  }

  @Get('pending/count')
  @Roles([Role.hospital_admin, Role.admin])
  countPendingAppointments(@Session() session: UserSession) {
    return this.appointment.countPendingHospitalAppointments(session);
  }

  @Get('operator')
  @Roles([Role.hospital_operator])
  findAllForOperator(
    @Session() session: UserSession,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('doctorId') doctorId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.appointment.findAllForOperator(
      session,
      page ?? 1,
      limit ?? 10,
      {
        status: status as any,
        source,
        doctorId,
        dateFrom,
        dateTo,
        search,
      },
    );
  }

  @Get('operator/kpis')
  @Roles([Role.hospital_operator])
  getOperatorKPIs(@Session() session: UserSession) {
    return this.appointment.getOperatorKPIs(session);
  }

  @Get(':id')
  @Roles([Role.user, Role.admin, Role.hospital_operator])
  findOne(@Param('id') id: string, @Session() session: UserSession) {
    return this.appointment.findOne(id, session);
  }

  @Get('doctor/overview')
  @Roles([Role.doctor])
  doctorOverview(@Session() session: UserSession) {
    return this.appointment.doctorOverview(session);
  }

  @Patch(':id/approve')
  @Roles([Role.hospital_operator, Role.admin])
  approve(
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
    return this.appointment.approveAppointment(id, session);
  }

  @Patch(':id/reschedule')
  @Roles([Role.hospital_operator, Role.admin])
  reschedule(
    @Param('id') id: string,
    @Body() body: { newSlotId: string },
    @Session() session: UserSession,
  ) {
    return this.appointment.rescheduleAppointment(
      id,
      body.newSlotId,
      session,
    );
  }

  @Patch(':id/refund')
  @Roles([Role.hospital_operator, Role.admin])
  refund(@Param('id') id: string, @Session() session: UserSession) {
    return this.appointment.refundAppointment(id, session);
  }

  @Patch(':id')
  @Roles([Role.user, Role.admin, Role.hospital_operator])
  updateOne(
    @Param('id') id: string,
    @Body() data: updateAppointment,
    @Session() session: UserSession,
  ) {
    return this.appointment.updateOne(id, data, session);
  }

  // @Post('payment/chapa/webhook')
  // @HttpCode(HttpStatus.OK)
  // verify(
  //   @Body() data: chapaWebhookPayload,
  //   @Headers('x-chapa-signature') chapaSignature: string,
  // ) {
  //   return this.appointment.verifyPayment(data, chapaSignature);
  // }
}
