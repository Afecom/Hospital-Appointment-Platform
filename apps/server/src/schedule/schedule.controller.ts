import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { Session, Roles, type UserSession } from '@thallesp/nestjs-better-auth';
import {
  Role,
  ScheduleStatus,
  ScheduleType,
} from '../../generated/prisma/enums.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Roles([Role.doctor, Role.admin])
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Session() session: UserSession,
  ) {
    return this.scheduleService.createSchedule(createScheduleDto, session);
  }

  @Get('count')
  @Roles([Role.hospital_admin])
  countActiveSchedules(@Session() session: UserSession) {
    return this.scheduleService.countActiveSchedules(session);
  }

  @Get('approved/:id')
  @Roles([Role.admin])
  findMany(
    @Param('id') doctorId: string,
    @Query('hospitalId') hospitalId: string,
    @Query('date') date: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.scheduleService.findApprovedSchedules(
      doctorId,
      hospitalId,
      date,
      startDate,
      endDate,
    );
  }

  @Get()
  @Roles([Role.hospital_admin])
  getScheduleForAdmin(
    @Query('status') status: ScheduleStatus,
    @Query('type') type: ScheduleType,
    @Query('doctorId') doctorId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Session() session: UserSession,
  ) {
    return this.scheduleService.findSchedulesForAdmin(
      session,
      status,
      type,
      doctorId,
      page,
      limit,
    );
  }

  @Get('pending/count')
  @Roles([Role.hospital_admin])
  countPendingSchedules(@Session() session: UserSession) {
    return this.scheduleService.countPendingHospitalSchedules(session);
  }

  @Patch('admin/:id/status')
  @Roles([Role.hospital_admin])
  approve(
    @Body() status: ScheduleStatus,
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
    return this.scheduleService.approve(id, session, status);
  }

  @Patch('update/:id')
  @Roles([Role.doctor])
  update(
    @Param('id') scheduleId: string,
    @Body() data: UpdateScheduleDto,
    @Session() session: UserSession,
  ) {
    return this.scheduleService.updateSchedule(data, session, scheduleId);
  }

  @Delete(':id')
  @Roles([Role.doctor])
  remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.scheduleService.remove(id, session);
  }
  @Get('doctor/my')
  @Roles([Role.doctor])
  findDoctorSchedule(
    @Query('hospitalId') hospitalId: string,
    @Query('type') type: ScheduleType,
    @Query('status') status: ScheduleStatus,
    @Query('date') date: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Session() session: UserSession,
  ) {
    const userId = session.user.id;
    return this.scheduleService.doctorsSchedule(
      userId,
      hospitalId,
      status,
      type,
      date,
      startDate,
      endDate,
      page,
      limit,
    );
  }
}
