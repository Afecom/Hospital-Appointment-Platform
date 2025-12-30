import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

// Mocks for bullmq and generator services (ESM-aware)
const addMock = jest.fn();
const workerMock = jest.fn();

jest.unstable_mockModule('bullmq', () => ({
  Queue: class {
    add = addMock;
    constructor() {
      this.add = addMock;
    }
  },
  Worker: workerMock,
  Job: class {},
}));

const generateInitialMock = jest.fn();
const fillMissingMock = jest.fn();

// Also mock using the relative paths as resolved by jest (no .js extension)
jest.unstable_mockModule(
  '../../workers/services/slot_generation/initial-slot-generator.service',
  () => ({
    generateInitialSlots: generateInitialMock,
  }),
);
jest.unstable_mockModule(
  '../../workers/services/slot_generation/daily-backfill-slots.service',
  () => ({
    fillMissingSlotsWorker: fillMissingMock,
  }),
);

describe('slotService & slotworker', () => {
  let slotServiceModule: any;
  let slotSvc: any;
  let bullmq: any;
  let workerModule: any;

  beforeAll(async () => {
    // import modules after setting up mocks
    bullmq = await import('bullmq');
    const svcMod = await import('./slot.service.js');
    // use Nest testing module to get the provider
    const module: TestingModule = await Test.createTestingModule({
      providers: [svcMod.slotService],
    }).compile();
    slotSvc = module.get(svcMod.slotService);

    // import worker module (which will instantiate Worker using mocked bullmq.Worker)
    workerModule = await import('../../workers/slot.worker.js');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('slotService: onScheduleApproved enqueues generate-initial-slots', async () => {
    await slotSvc.onScheduleApproved('sched1');
    expect(addMock).toHaveBeenCalledWith(
      'generate-initial-slots',
      { scheduleId: 'sched1' },
      { jobId: `initialSlot-sched1` },
    );
  });

  it('slotService: dailyBackFill enqueues fill-missing-slots', async () => {
    await slotSvc.dailyBackFill('sched2');
    expect(addMock).toHaveBeenCalled();
    const callArgs = addMock.mock.calls[0];
    expect(callArgs[0]).toBe('fill-missing-slots');
    expect(callArgs[1]).toEqual({ scheduleId: 'sched2' });
  });

  it('slotworker: module loads and exports slotworker', () => {
    expect(workerModule).toBeDefined();
    expect(workerModule.slotworker).toBeDefined();
  });
});
