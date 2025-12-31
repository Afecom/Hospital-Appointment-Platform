import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prisma } from './prisma.js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { phoneNumber } from 'better-auth/plugins';
import { bearer } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins';
import axios from 'axios';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    modelName: 'User',
    fields: {
      name: 'fullName',
    },
    additionalFields: {
      gender: {
        type: 'string',
        required: false,
      },
      email: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
      dateOfBirth: {
        type: 'string',
        required: false,
      },
      imageUrl: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, ctx) => {
        // Prevent sending OTP for phone numbers that already exist
        try {
          const existing = await prisma.user.findFirst({
            where: { phoneNumber },
          });
          if (existing) {
            // Stop the flow: throw an error so the caller knows the number is taken
            throw new Error('Phone number already registered');
          }
        } catch (err) {
          // If prisma lookup throws, rethrow to stop OTP sending
          throw err;
        }

        const token = process.env.SMS_TOKEN;
        try {
          await axios.post(
            'https://api.afromessage.com/api/send',
            {
              to: phoneNumber,
              message: `your OTP code is ${code}`,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } catch (error) {
          console.error(error);
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@my-site.com`;
        },
        getTempName: (phoneNumber) => {
          return phoneNumber;
        },
      },
      requireVerification: true,
    }),
    bearer(),
    admin(),
  ],
});
