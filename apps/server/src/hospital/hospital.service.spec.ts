import { Test, TestingModule } from '@nestjs/testing';
import { HospitalService } from './hospital.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ChapaService } from 'chapa-nestjs';

describe('HospitalService', () => {
  let service: HospitalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HospitalService,
        { provide: DatabaseService, useValue: {} },
        { provide: ChapaService, useValue: {} },
      ],
    }).compile();

    service = module.get<HospitalService>(HospitalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
