import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [DatabaseModule, CloudinaryModule]
})
export class UserModule {}
