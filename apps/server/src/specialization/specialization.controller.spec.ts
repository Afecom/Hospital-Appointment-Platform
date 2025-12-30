import { Test, TestingModule } from '@nestjs/testing';
import { SpecializationController } from './specialization.controller.js';
import { SpecializationService } from './specialization.service.js';
import { DatabaseService } from '../database/database.service.js';

describe('SpecializationController', () => {
  let controller: SpecializationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecializationController],
      providers: [SpecializationService, { provide: DatabaseService, useValue: {} }],
    }).compile();

    controller = module.get<SpecializationController>(SpecializationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
