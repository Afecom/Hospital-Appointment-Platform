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
import { Role } from '@hap/prisma';

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
  @Roles([Role.admin])
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }

  @Post('apply')
  apply(@Body() body: applyDoctorDto, @Session() session: UserSession) {
    return this.doctorService.applyDoctor(body, session);
  }

  @Post('approve-request')
  @Roles([Role.admin])
  approve(@Body() body: approveDoctor) {
    return this.doctorService.approveDoctor(body);
  }

  @Post('reject-request')
  @Roles([Role.hospital_admin])
  reject(@Body() body: rejectDoctor) {
    return this.doctorService.rejectDoctor(body);
  }
}
