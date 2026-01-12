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
import { Session, type UserSession, Roles } from '@thallesp/nestjs-better-auth';
import { DoctorService } from './doctor.service.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { applyHospitalDoctorDto } from './dto/apply-hospital-doctor.dto.js';
import {
  approveDoctor,
  rejectDoctor,
} from './dto/approve-reject-doctor.dto.js';
import { Role } from '../../generated/prisma/enums.js';
import { applyDoctor } from './dto/apply-doctor.dto.js';
import {
  approveHospitalDoctor,
  doctorHospitalApplication,
} from './dto/approve-reject-hospital-doctor.dto.js';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  @Roles([Role.admin])
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.doctorService.findAll(page, limit);
  }

  @Get('hospital/pending')
  @Roles([Role.hospital_admin])
  getPendingHospitalDoctors(
    @Session() session: UserSession,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorService.getPendingHospitalDoctors(session, page, limit);
  }

  @Get('hospital/pending/count')
  @Roles([Role.hospital_admin])
  countPendingDoctors(@Session() session: UserSession) {
    return this.doctorService.countPendingHospitalDoctors(session);
  }

  @Get('hospital')
  @Roles([Role.hospital_admin])
  hospitalDoctors(
    @Session() session: UserSession,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorService.getHospitalDoctors(session, page, limit);
  }

  @Get('hospital/count')
  @Roles([Role.hospital_admin])
  CountHospitalDoctors(@Session() session: UserSession) {
    return this.doctorService.countHospitalDoctors(session);
  }

  @Get('hospital/inactive')
  @Roles([Role.hospital_admin])
  inactiveHospitalDoctors(
    @Session() session: UserSession,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorService.getInactiveHospitalDoctors(session, page, limit);
  }

  // @Patch(':id')
  // @Roles([Role.doctor, Role.admin])
  // update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
  //   return this.doctorService.update(id, updateDoctorDto);
  // }

  // @Delete(':id')
  // @Roles([Role.doctor, Role.admin])
  // remove(@Param('id') id: string) {
  //   return this.doctorService.remove(id);
  // }

  @Post('apply/hospital')
  @Roles([Role.doctor])
  apply(@Body() body: applyHospitalDoctorDto, @Session() session: UserSession) {
    return this.doctorService.applyHospitalDoctor(body, session);
  }

  @Patch('hospital/approve')
  @Roles([Role.hospital_admin])
  approveHospitalDoctor(@Body() body: approveHospitalDoctor) {
    return this.doctorService.approveHospitalDoctor(body);
  }

  @Get('hospital/application')
  @Roles([Role.hospital_admin, Role.admin])
  getHospitalDoctorApplications(
    @Session() session: UserSession,
    @Query('status') status: 'approved' | 'rejected' | 'pending',
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorService.getHospitalDoctorApplications(
      session,
      status,
      page,
      limit,
    );
  }

  @Patch('hospital/reject')
  @Roles([Role.hospital_admin])
  rejectHospitalDoctor(@Body() body: doctorHospitalApplication) {
    return this.doctorService.rejectHospitalDoctor(body);
  }

  @Post('apply')
  @Roles([Role.user])
  applyDoctor(@Body() body: applyDoctor, @Session() session: UserSession) {
    return this.doctorService.applyDoctor(body, session);
  }

  @Patch('approve')
  @Roles([Role.admin])
  approve(@Body() body: approveDoctor) {
    return this.doctorService.approveDoctor(body);
  }

  @Patch('reject')
  @Roles([Role.admin])
  reject(@Body() body: rejectDoctor) {
    return this.doctorService.rejectDoctor(body);
  }

  @Get('pending')
  @Roles([Role.admin])
  getPendingDoctors(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorService.getPendingDoctors(page, limit);
  }
}
