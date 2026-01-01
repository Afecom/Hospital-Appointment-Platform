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
import {
  Session,
  type UserSession,
  Roles,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';
import { DoctorService } from './doctor.service.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { applyDoctorDto } from './dto/apply-doctor.dto.js';
import { approveDoctor } from './dto/approve-doctor.dto.js';
import { rejectDoctor } from './dto/reject-doctor.dto.js';
import { Role } from '../../generated/prisma/enums.js';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  @Roles([Role.admin])
  findAll() {
    return this.doctorService.findAll();
  }

  @Get('pending')
  @Roles([Role.hospital_admin])
  getPendingDoctors(
    @Session() session: UserSession,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorService.getPendingDoctors(session, page, limit);
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

  @Get('hospital/inactive')
  @Roles([Role.hospital_admin])
  inactiveHospitalDoctors(
    @Session() session: UserSession,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorService.getInactiveHospitalDoctors(session, page, limit);
  }

  @Get(':id')
  @Roles([Role.admin, Role.hospital_admin])
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Patch(':id')
  @Roles([Role.doctor, Role.admin])
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @Roles([Role.doctor, Role.admin])
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }

  @Post('apply')
  @Roles([Role.user])
  apply(@Body() body: applyDoctorDto, @Session() session: UserSession) {
    return this.doctorService.applyDoctor(body, session);
  }

  @Post('approve-request')
  @Roles([Role.admin, Role.hospital_admin])
  approve(@Body() body: approveDoctor) {
    return this.doctorService.approveDoctor(body);
  }

  @Post('reject-request')
  @Roles([Role.hospital_admin, Role.admin])
  reject(@Body() body: rejectDoctor) {
    return this.doctorService.rejectDoctor(body);
  }
}
