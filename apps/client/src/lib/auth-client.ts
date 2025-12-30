import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";
import "dotenv/config";
export const authClient = createAuthClient({
  plugins: [phoneNumberClient()],
  baseURL: process.env.AUTH_CLIENT_URL,
});
