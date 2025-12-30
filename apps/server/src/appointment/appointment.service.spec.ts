import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { appointmentService } from './appointment.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ChapaService } from 'chapa-nestjs';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';

describe('appointmentService', () => {
  let service: appointmentService;
  const mockDb: any = {};
  const mockChapa: any = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        appointmentService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: ChapaService, useValue: mockChapa },
      ],
    }).compile();

    service = module.get<appointmentService>(appointmentService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.CHAPA_SECRET_HASH;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createAppointment: success returns checkout url and updates slot & creates appointment', async () => {
    const dto: any = { slotId: 'slot1', notes: 'note' };
    const session: any = {
      user: { id: 'user1', name: 'Alice', email: 'a@a.com' },
    };

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
      } as never),
      update: jest.fn().mockResolvedValue({} as never),
    };
    mockDb.appointment = { create: jest.fn().mockResolvedValue({} as never) };
    mockDb.$transaction = jest.fn();

    mockChapa.generateTransactionReference = jest
      .fn()
      .mockResolvedValue('tx123' as never);
    mockChapa.initialize = jest
      .fn()
      .mockResolvedValue({
        data: { checkout_url: 'https://checkout' },
      } as never);

    // attach prisma-like methods on root
    mockDb.slot.findUnique = mockDb.slot.findUnique;
    mockDb.slot.update = mockDb.slot.update;

    const res = await service.createAppointment(dto, session as any);
    expect(res).toBe('https://checkout');
    expect(mockDb.slot.update).toHaveBeenCalledWith({
      where: { id: 'slot1' },
      data: { status: 'booked' },
    });
    expect(mockDb.appointment.create).toHaveBeenCalled();
  });

  it('createAppointment: throws NotFoundException when slot not found', async () => {
    const dto: any = { slotId: 'slot2' };
    const session: any = {
      user: { id: 'user1', name: 'Alice', email: 'a@a.com' },
    };
    mockDb.slot = { findUnique: jest.fn().mockResolvedValue(null as never) };
    await expect(
      service.createAppointment(dto, session as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('findOne: throws NotFoundException when appointment not found', async () => {
    mockDb.appointment = {
      findUnique: jest.fn().mockResolvedValue(null as never),
    };
    const session: any = { user: { id: 'u1', role: 'admin' } };
    await expect(service.findOne('nope', session as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne: throws UnauthorizedException when user role and not owner', async () => {
    mockDb.appointment = {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'a1', customerId: 'other' } as never),
    };
    const session: any = { user: { id: 'user1', role: 'user' } };
    await expect(service.findOne('a1', session as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('updateOne: succeeds for owner and calls update', async () => {
    const dto: any = { notes: 'updated' };
    mockDb.appointment = {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'a1', customerId: 'user1' } as never),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'a1', notes: 'updated' } as never),
    };
    const session: any = { user: { id: 'user1', role: 'user' } };
    const res = await service.updateOne('a1', dto, session as any);
    expect(mockDb.appointment.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: dto,
    });
    expect(res).toHaveProperty('notes', 'updated');
  });

  it('verifyPayment: throws UnauthorizedException on bad signature', async () => {
    process.env.CHAPA_SECRET_HASH = 'secret';
    const data = { event: 'charge.success', tx_ref: 'txx' };
    await expect(
      service.verifyPayment(data as any, 'bad-sign'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('verifyPayment: non-success event sets slot available and throws BadRequestException', async () => {
    process.env.CHAPA_SECRET_HASH = 'secret';
    const payload = { event: 'charge.failed', tx_ref: 'tx1' };
    const sig = createHmac('sha256', process.env.CHAPA_SECRET_HASH!)
      .update(JSON.stringify(payload))
      .digest('hex');

    mockDb.appointment = {
      findUnique: jest.fn().mockResolvedValue({
        tx_ref: 'tx1',
        slotId: 'slot1',
        slot: { id: 'slot1' },
        schedule: { hospital: { fee: 100 } },
      } as never),
    };
    mockDb.slot = { update: jest.fn().mockResolvedValue({} as never) };

    await expect(service.verifyPayment(payload as any, sig)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockDb.slot.update).toHaveBeenCalledWith({
      where: { id: 'slot1' },
      data: { status: 'available' },
    });
  });

  it('verifyPayment: successful verification updates appointment isPaid', async () => {
    process.env.CHAPA_SECRET_HASH = 'secret';
    const payload = { event: 'charge.success', tx_ref: 'tx123' };
    const sig = createHmac('sha256', process.env.CHAPA_SECRET_HASH!)
      .update(JSON.stringify(payload))
      .digest('hex');

    mockDb.appointment = {
      findUnique: jest.fn().mockResolvedValue({
        tx_ref: 'tx123',
        slotId: 'slot1',
        slot: { id: 'slot1' },
        schedule: { hospital: { fee: 100 } },
      } as never),
      update: jest.fn().mockResolvedValue({} as never),
    };
    mockDb.slot = { update: jest.fn().mockResolvedValue({} as never) };

    mockChapa.verify = jest.fn().mockResolvedValue({
      status: 'success',
      data: { amount: (100 + 20).toString(), currency: 'ETB', tx_ref: 'tx123' },
    } as never);

    await expect(
      service.verifyPayment(payload as any, sig),
    ).resolves.toBeUndefined();
    expect(mockDb.appointment.update).toHaveBeenCalledWith({
      where: { tx_ref: 'tx123' },
      data: { isPaid: true },
    });
  });

  it('findAll: returns paginated appointments and meta', async () => {
    const appointments = [{ id: 'a1' }, { id: 'a2' }];
    mockDb.appointment = {
      findMany: (jest.fn() as any).mockResolvedValue(appointments),
      count: (jest.fn() as any).mockResolvedValue(20),
    };
    mockDb.$transaction = jest
      .fn()
      .mockImplementation((arr: any) => Promise.all(arr));
    const res = await service.findAll(2, 2);
    expect(res).toHaveProperty('appointments');
    expect(res).toHaveProperty('meta');
    expect(res.appointments).toEqual(appointments);
    expect(res.meta.page).toBe(2);
  });
});
