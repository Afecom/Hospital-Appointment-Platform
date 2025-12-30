import { Test, TestingModule } from '@nestjs/testing';
import { appointmentController } from './appointment.controller.js';
import { appointmentService } from './appointment.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ChapaService } from 'chapa-nestjs';

describe('appointment integration controller+service', () => {
  let controller: appointmentController;
  const mockDb: any = {};
  const mockChapa: any = {};

  beforeEach(async () => {
    mockDb.slot = {
      findUnique: jest.fn().mockResolvedValue({
        id: 'slot1',
        slotStart: '2025-01-01T10:00:00Z',
        slotEnd: '2025-01-01T10:30:00Z',
        status: 'available',
        schedule: {
          id: 'sched1',
          doctorId: 'doc1',
          hospital: { id: 'h1', fee: 100, subAccountId: 'sub1' },
        },
      }),
      update: jest.fn().mockResolvedValue({}),
    };
    mockDb.appointment = { create: jest.fn().mockResolvedValue({}) };

    mockChapa.generateTransactionReference = jest
      .fn()
      .mockResolvedValue('tx123');
    mockChapa.initialize = jest
      .fn()
      .mockResolvedValue({ data: { checkout_url: 'https://checkout' } });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [appointmentController],
      providers: [
        appointmentService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: ChapaService, useValue: mockChapa },
      ],
    }).compile();

    controller = module.get<appointmentController>(appointmentController);
  });

  it('create appointment via controller returns checkout url', async () => {
    const dto: any = { slotId: 'slot1', notes: 'note' };
    const session: any = {
      user: { id: 'user1', name: 'Alice', email: 'a@a.com' },
    };
    const res = await controller.create(dto, session as any);
    expect(res).toBe('https://checkout');
  });
});
