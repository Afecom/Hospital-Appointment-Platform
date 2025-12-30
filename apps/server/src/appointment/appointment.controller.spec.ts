import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { appointmentController } from './appointment.controller.js';
import { appointmentService } from './appointment.service.js';

describe('appointmentController', () => {
  let controller: appointmentController;
  const mockService: any = {
    findAll: jest.fn(),
    createAppointment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [appointmentController],
      providers: [{ provide: appointmentService, useValue: mockService }],
    }).compile();

    controller = module.get<appointmentController>(appointmentController);
  });

  afterEach(() => jest.resetAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findall forwards page and limit to service', () => {
    controller.findall(3, 5);
    expect(mockService.findAll).toHaveBeenCalledWith(3, 5);
  });

  it('create calls service.createAppointment', () => {
    const dto: any = { slotId: 's1' };
    const session: any = { user: { id: 'u1' } };
    mockService.createAppointment.mockResolvedValue('ok');
    controller.create(dto, session as any);
    expect(mockService.createAppointment).toHaveBeenCalledWith(dto, session);
  });
});
