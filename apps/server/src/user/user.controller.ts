import {
  Controller,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { updateMinorUser } from './dto/update-minoruser.dto.js';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { DatabaseService } from '../database/database.service.js';
import { changePasswordDto } from './dto/change-password.dto.js';
import { updateRoleDto } from './dto/updateRole.dto.js';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private cloudinaryService: CloudinaryService,
    private prisma: DatabaseService,
  ) {}

  @Patch('complete-profile')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfile(
    @Body() body: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
  ) {
    const userId: string = session.user.id;
    const sessionToken: string = session.session.token;

    let imageUrl: string | undefined;
    let imageId: string | undefined;

    if (file) {
      try {
        const upload = await this.cloudinaryService.uploadImage(
          file.buffer,
          'users/profile-pictures',
        );
        imageUrl = upload.secure_url;
        imageId = upload.public_id;
      } catch (error) {
        console.log(error);
      }
    }

    return this.userService.updateProfile(
      userId,
      {
        ...body,
        ...(imageUrl && { imageUrl }),
        ...(imageId && { imageId }),
      },
      sessionToken,
    );
  }

  @Patch('profile/me')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updatePartialProfile(
    @Body() body: updateMinorUser,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
  ) {
    const userId = session.user.id;

    let imageUrl: string | undefined;
    let imageId: string | undefined;

    if (file) {
      try {
        const user = await this.prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });
        if (user.imageId)
          await this.cloudinaryService.deleteImage(user.imageId);
        const upload = await this.cloudinaryService.uploadImage(
          file.buffer,
          'users/profile-pictures',
        );
        imageUrl = upload.secure_url;
        imageId = upload.public_id;
      } catch (error) {
        console.log(error);
      }
    }

    return this.userService.updatePartialProfile(userId, {
      ...body,
      ...(imageUrl && { imageUrl }),
      ...(imageId && { imageId }),
    });
  }

  @Get('profile/me')
  async getprofile(@Session() session: UserSession) {
    const userId = session.user.id;
    return this.userService.getProfile(userId);
  }

  @Patch('change-password')
  async changePassword(
    @Body() body: changePasswordDto,
    @Session() session: UserSession,
  ) {
    const token = session.session.token;
    return this.userService.changePassword(token, body);
  }

  @AllowAnonymous()
  @Patch('update-role')
  async updateRole(@Body() body: updateRoleDto) {
    return this.userService.updateRole(body);
  }
}
