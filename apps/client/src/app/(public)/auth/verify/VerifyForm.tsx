"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Props = { phone: string };

export default function VerifyForm({ phone }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authClient.phoneNumber.verify({
        phoneNumber: phone,
        code,
        disableSession: false,
      });
      if (res.error) setAuthError(res.error.message!);
      else if (res.data) {
        // browser will receive session cookies set by the auth endpoints
        router.replace("/auth/complete-profile");
      }
    } catch (err) {
      throw new Error("Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white shadow-xl rounded-lg p-8 relative"
    >
      <input type="hidden" name="phoneNumber" value={phone} />
      <div className="w-full mb-3">
        <label
          htmlFor="codeInput"
          className="text-xl md:text-3xl lg:text-lg text-gray-800"
        >
          code
        </label>
        <br />
        <input
          type="number"
          name="code"
          id="codeInput"
          minLength={6}
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`rounded-md border border-gray-400 mt-2 h-10 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg outline-blue-950 ${
            authError ? "outline-none border-red-500 border-2" : ""
          }`}
        />
      </div>
      <div className="mt-5">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-green-400 h-10 md:h-14 lg:h-10 pb-0 text-white font-semibold md:text-3xl lg:text-xl hover:cursor-pointer hover:bg-blue-900"
        >
          {loading ? "Verifying..." : "verify"}
        </button>
      </div>
      <p className={`absolute text-lg text-red-500 right-8 bottom-0`}>
        {authError}
      </p>
    </form>
  );
}
