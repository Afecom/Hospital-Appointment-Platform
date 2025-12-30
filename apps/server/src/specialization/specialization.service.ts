import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpecializationDto } from './dto/create-specialization.dto.js';
import { UpdateSpecializationDto } from './dto/update-specialization.dto.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class SpecializationService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createSpecializationDto: CreateSpecializationDto) {
    const specialization = await this.databaseService.specialization.create({
      data: createSpecializationDto
    });
    return specialization;
  }

  async findAll() {
    const specializations = await this.databaseService.specialization.findMany();
    if (specializations.length === 0) throw new NotFoundException("Couldn't find any specializations");
    return specializations;
  }

  async findOne(id: string) {
    const specialization = await this.databaseService.specialization.findUniqueOrThrow({
      where: { id }
    });
    if (!specialization) throw new NotFoundException("Couldn't find a specialization with the provided ID")
    return specialization;
  }

  async update(id: string, updateSpecializationDto: UpdateSpecializationDto) {
    const updated_specialization = await this.databaseService.specialization.update({
      where: { id },
      data: updateSpecializationDto
    });
    return updated_specialization;
  }

  async remove(id: string) {
    return await this.databaseService.specialization.delete({ where: { id } })
  }
}
