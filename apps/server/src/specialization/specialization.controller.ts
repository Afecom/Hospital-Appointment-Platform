import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { SpecializationService } from './specialization.service.js';
import { CreateSpecializationDto } from './dto/create-specialization.dto.js';
import { UpdateSpecializationDto } from './dto/update-specialization.dto.js';
import { Roles } from '@thallesp/nestjs-better-auth';
import { Role } from '@repo/database';

@Controller('specialization')
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  @Post()
  @Roles([Role.hospital_admin])
  create(
    @Body(ValidationPipe) createSpecializationDto: CreateSpecializationDto,
  ) {
    return this.specializationService.create(createSpecializationDto);
  }

  @Get()
  findAll() {
    return this.specializationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specializationService.findOne(id);
  }

  @Patch(':id')
  @Roles(['admin'])
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateSpecializationDto: UpdateSpecializationDto,
  ) {
    return this.specializationService.update(id, updateSpecializationDto);
  }

  @Delete(':id')
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.specializationService.remove(id);
  }
}
