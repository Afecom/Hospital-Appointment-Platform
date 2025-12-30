import { Test, TestingModule } from '@nestjs/testing';
import { HospitalController } from './hospital.controller.js';
import { HospitalService } from './hospital.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ChapaService } from 'chapa-nestjs';

describe('HospitalController', () => {
  let controller: HospitalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HospitalController],
      providers: [
        HospitalService,
        { provide: DatabaseService, useValue: {} },
        { provide: ChapaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<HospitalController>(HospitalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
