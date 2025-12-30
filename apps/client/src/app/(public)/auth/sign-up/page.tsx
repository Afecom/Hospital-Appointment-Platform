"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export default function signupPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setloading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const isPhoneInvalid = phoneNumber.length < 10 || phoneNumber.length > 10;
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setloading(true);
    try {
      const res = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });
      if (res.error) setAuthError(res.error.message!);
      else if (res.data) {
        router.push(`/auth/verify?phone=${encodeURIComponent(phoneNumber)}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  };
  return (
    <div className="flex-col justify-center items-center md:w-[50%] lg:w-[35%]">
      <h1 className="text-center text-3xl md:text-6xl lg:text-3xl font-semibold text-[#1E88E5] mb-6">
        Create Account
      </h1>
      <form
        onSubmit={onSubmit}
        className="bg-white shadow-xl rounded-lg p-8 relative"
      >
        <div className="w-full mb-3">
          <label
            htmlFor="phoneNumberInput"
            className="text-xl md:text-3xl lg:text-lg text-gray-800"
          >
            Phone Number
          </label>
          <br />
          <input
            type="tel"
            name="phoneNumber"
            minLength={10}
            maxLength={10}
            id="phoneNumberInput"
            value={phoneNumber}
            className={`rounded-md border outline-blue-950 border-gray-400 mt-2 h-10 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg ${
              phoneNumber && isPhoneInvalid ? "outline-none border-red-500" : ""
            }`}
            placeholder="0912345678"
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          {phoneNumber && isPhoneInvalid && (
            <p className="mt-2 text-red-500 text-sm">
              Phone number must be 10 in length
            </p>
          )}
        </div>
        <div className="mt-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-400 h-10 md:h-14 lg:h-10 pb-0 text-white font-semibold md:text-3xl lg:text-xl hover:cursor-pointer hover:bg-blue-900 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
        <p className={`absolute text-lg text-red-500 right-8 bottom-0`}>
          {authError}
        </p>
      </form>
    </div>
  );
}
