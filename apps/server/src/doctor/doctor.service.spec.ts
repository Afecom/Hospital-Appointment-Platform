import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from './doctor.service.js';
import { DatabaseService } from '../database/database.service.js';

describe('DoctorService', () => {
  let service: DoctorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorService, { provide: DatabaseService, useValue: {} }],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
