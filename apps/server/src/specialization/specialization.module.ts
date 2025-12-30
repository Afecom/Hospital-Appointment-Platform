import { Module } from '@nestjs/common';
import { SpecializationService } from './specialization.service.js';
import { SpecializationController } from './specialization.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  controllers: [SpecializationController],
  providers: [SpecializationService],
  imports: [DatabaseModule]
})
export class SpecializationModule { }
