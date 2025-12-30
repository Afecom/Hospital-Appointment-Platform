import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecializationDto } from './create-specialization.dto.js';

export class UpdateSpecializationDto extends PartialType(CreateSpecializationDto) {}
