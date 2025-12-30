import { Injectable, Inject } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary) {}

  async uploadImage(
    buffer: Buffer,
    folder = 'users/profile-pictures',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      upload.end(buffer);
    });
  }

  async deleteImage(publicId: string) {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }
}
