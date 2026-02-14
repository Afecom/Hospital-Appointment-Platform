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
  @Roles([Role.hospital_admin, Role.admin])
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

  @Get(':id')
  @Roles([Role.user, Role.admin])
  findOne(@Param('id') id: string, @Session() session: UserSession) {
    return this.appointment.findOne(id, session);
  }

  @Get('doctor/overview')
  @Roles([Role.doctor])
  doctorOverview(@Session() session: UserSession) {
    return this.appointment.doctorOverview(session);
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
