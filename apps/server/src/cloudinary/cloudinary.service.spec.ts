import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service.js';
import { MOCK_CLOUDINARY_PROVIDER } from '../test/test-providers.js';

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService, MOCK_CLOUDINARY_PROVIDER],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
