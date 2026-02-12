import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { HospitalService } from './hospital.service.js';
import { CreateHospitalDto } from './dto/create-hospital.dto.js';
import { UpdateHospitalDto } from './dto/update-hospital.dto.js';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { Role } from '../../generated/prisma/enums.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Controller('hospital')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private cloudinary: CloudinaryService,
  ) {}

  @Post()
  @Roles([Role.admin])
  @UseInterceptors(FileInterceptor('profilePicture'))
  async create(
    @Body(ValidationPipe) createHospitalDto: CreateHospitalDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let logoUrl =
      'https://ethiotebibhospital.com/wp-content/uploads/2024/11/Ethiotebib-white.png';
    let logoId = 'id1';
    if (file) {
      try {
        const uploaded = await this.cloudinary.uploadImage(
          file.buffer,
          'hospital/profile-pictures',
        );
        logoUrl = uploaded.secure_url;
        logoId = uploaded.public_id;
      } catch (error) {
        console.error('Couldnt upload the image', error);
      }
    }
    return this.hospitalService.create(createHospitalDto, logoUrl, logoId);
  }

  @Get()
  findAll() {
    return this.hospitalService.findAll();
  }

  @Get('unique')
  findOne(@Session() session: UserSession) {
    return this.hospitalService.findOne(session);
  }

  @Patch(':id')
  @Roles([Role.admin])
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateHospitalDto: UpdateHospitalDto,
  ) {
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Delete(':id')
  @Roles([Role.admin])
  remove(@Param('id') id: string) {
    return this.hospitalService.remove(id);
  }

  @Get('/specialization/:id')
  findAllBySpecialization(@Param('id') id: string) {
    return this.hospitalService.findAllBySpecialization(id);
  }

  @Get('doctor')
  @Roles([Role.doctor, Role.admin])
  findDoctorHospitals(@Session() session: UserSession) {
    return this.hospitalService.findDoctorHospitals(session);
  }
}
