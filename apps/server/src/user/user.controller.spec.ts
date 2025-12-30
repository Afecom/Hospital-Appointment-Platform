import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { DatabaseService } from '../database/database.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: DatabaseService, useValue: {} },
        { provide: CloudinaryService, useValue: { uploadImage: async () => ({ secure_url: 'u', public_id: 'id' }), deleteImage: async () => ({ result: 'ok' }) } },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
