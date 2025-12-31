import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { updateMinorUser } from './dto/update-minoruser.dto.js';
import { changePasswordDto } from './dto/change-password.dto.js';
import { UnauthorizedException } from '@nestjs/common';
import { auth } from '../lib/auth.js';
import { updateRoleDto } from './dto/updateRole.dto.js';

@Injectable()
export class UserService {
  constructor(private prisma: DatabaseService) {}

  async updateProfile(
    userId: string,
    data: UpdateUserDto,
    sessionToken?: string,
  ) {
    if (!sessionToken)
      throw new UnauthorizedException(
        'A session is required to set a password',
      );
    try {
      const authResponse = await auth.api.setPassword({
        body: { newPassword: data.password as string },
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      console.log(authResponse);
    } catch (error) {
      console.log(error);
    }
    delete data.password;
    const updatedProfile = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        isOnboardingComplete: true,
      },
    });

    return updatedProfile;
  }

  async updatePartialProfile(userId: string, data: updateMinorUser) {
    return await this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getProfile(userID: string) {
    return await this.prisma.user.findUniqueOrThrow({ where: { id: userID } });
  }

  async changePassword(sessionToken: string, data: changePasswordDto) {
    return await auth.api.changePassword({
      body: {
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      },
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
  }

  async updateRole(data: updateRoleDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { phoneNumber: data.phoneNumber },
        data: {
          role: data.role,
        },
      });
      return updatedUser;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
}
