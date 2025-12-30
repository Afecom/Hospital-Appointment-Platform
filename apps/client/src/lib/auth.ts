import { betterAuth } from "better-auth";
import { prisma } from "@/lib/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import axios from "axios";

const baseAdapter = prismaAdapter(prisma, {
  provider: "postgresql",
});

const safeAdapter = new Proxy(baseAdapter, {
  get(target, prop, receiver) {
    const orig = Reflect.get(target as any, prop, receiver);
    if (typeof orig !== "function") return orig;
    return async (...args: any[]) => {
      try {
        return await orig.apply(target, args);
      } catch (err) {
        // log and return safe default values for common adapter methods
        // to avoid crashing the dev server when DB schema mismatches exist
        // (we'll surface the error but keep the app running)
        // eslint-disable-next-line no-console
        console.error("[Auth adapter] Caught error in", String(prop), err);
        if (String(prop) === "findSession") return null;
        if (String(prop) === "findSessions") return [];
        if (String(prop) === "findUser") return null;
        if (String(prop) === "findUsers") return [];
        return null;
      }
    };
  },
});

export const auth = betterAuth({
  database: safeAdapter,
  user: {
    fields: {
      name: "fullName",
      image: "imageUrl",
    },
    modelName: "User",
    additionalFields: {
      gender: {
        type: "string",
        required: false,
      },
      email: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
      },
      dateOfBirth: {
        type: "string",
        required: false,
      },
      imageUrl: {
        type: "string",
        required: false,
      },
      imageId: {
        type: "string",
        required: false,
      },
      isOnboardingComplete: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      fullName: {
        type: "string",
        required: false,
      },
    },
  },
  trustedOrigins: [
    "http://192.168.1.2:3000",
    "http://192.168.1.101:3000",
    "http://localhost:3000",
  ],
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, ctx) => {
        // Prevent sending OTP for phone numbers that already exist
        // try {
        //   const existing = await prisma.user.findFirst({
        //     where: { phoneNumber },
        //   });
        //   if (existing) {
        //     // Stop the flow: throw an error so the caller knows the number is taken
        //     throw new Error("Phone number already registered");
        //   }
        // } catch (err) {
        //   // If prisma lookup throws, rethrow to stop OTP sending
        //   throw err;
        // }

        const token = process.env.SMS_TOKEN;
        try {
          await axios.post(
            "https://api.afromessage.com/api/send",
            {
              to: phoneNumber,
              message: `your OTP code is ${code}`,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
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
