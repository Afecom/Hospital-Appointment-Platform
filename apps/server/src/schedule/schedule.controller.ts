import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  BadRequestException,
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

  @Post('apply')
  @Roles([Role.doctor, Role.admin])
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Session() session: UserSession,
  ) {
    return this.scheduleService.createSchedule(createScheduleDto, session);
  }

  @Get('active/count')
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
    @Query('expired') expired: boolean,
    @Query('deactivated') deactivated: boolean,
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
      expired,
      deactivated,
    );
  }

  @Get('pending/count')
  @Roles([Role.hospital_admin])
  countPendingSchedules(@Session() session: UserSession) {
    return this.scheduleService.countPendingHospitalSchedules(session);
  }

  @Patch('approve/:id')
  @Roles([Role.hospital_admin])
  approve(@Param('id') id: string, @Session() session: UserSession) {
    return this.scheduleService.approve(id, session);
  }

  @Patch('reject/:id')
  @Roles([Role.hospital_admin])
  reject(@Param('id') id: string, @Session() session: UserSession) {
    return this.scheduleService.reject(id, session);
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

  @Patch(':id')
  @Roles([Role.doctor, Role.hospital_admin, Role.admin])
  actionHandler(
    @Param('id') id: string,
    @Body()
    body: { action?: 'delete' | 'deactivate' | 'undo' | 'activate' },
  ) {
    const action =
      typeof body === 'string' ? body : body && (body.action as any);
    if (!action) {
      throw new BadRequestException('No action provided');
    }
    return this.scheduleService.handleAction(id, action);
  }
  @Get('doctor')
  @Roles([Role.doctor])
  findDoctorSchedule(
    @Query('hospitalId') hospitalId: string,
    @Query('type') type: ScheduleType,
    @Query('status') status: ScheduleStatus,
    @Query('deactivated') deactivated: boolean,
    @Query('expired') expired: boolean,
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
      deactivated,
      expired,
    );
  }
}
