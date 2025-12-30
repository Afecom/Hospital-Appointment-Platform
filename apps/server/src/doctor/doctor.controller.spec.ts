import { Test, TestingModule } from '@nestjs/testing';
import { DoctorController } from './doctor.controller.js';
import { DoctorService } from './doctor.service.js';
import { DatabaseService } from '../database/database.service.js';

describe('DoctorController', () => {
  let controller: DoctorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorController],
      providers: [DoctorService, { provide: DatabaseService, useValue: {} }],
    }).compile();

    controller = module.get<DoctorController>(DoctorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
