import { Test, TestingModule } from '@nestjs/testing';
import { SpecializationService } from './specialization.service.js';
import { DatabaseService } from '../database/database.service.js';

describe('SpecializationService', () => {
  let service: SpecializationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpecializationService, { provide: DatabaseService, useValue: {} }],
    }).compile();

    service = module.get<SpecializationService>(SpecializationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
