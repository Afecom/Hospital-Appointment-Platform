"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { redirect, RedirectType } from "next/navigation";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  RoleHomePages,
  DefaultRedirect,
} from "../../../../lib/redirect-config";
import { Role } from "@repo/database";

export default function loginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const isPasswordTooShort = password.length < 8;
  const isPhoneInvalid = phoneNumber.length < 10 || phoneNumber.length > 10;
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authClient.signIn.phoneNumber({
        phoneNumber,
        password,
        rememberMe,
      });
      if (res.error) setAuthError(res.error.message!);
      else if (res.data) {
        try {
          const sessionRes = await authClient.getSession();
          if (sessionRes.error) return router.replace(DefaultRedirect);
          if (sessionRes.data) {
            const userRole = sessionRes.data.user.role;
            const homePath = RoleHomePages[userRole as Role];
            return router.replace(homePath);
          }
        } catch (err) {
          return router.replace(DefaultRedirect);
        }
      }
    } catch (error) {
      throw new Error("unable to login");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex-col justify-center items-center md:w-[50%] lg:w-[35%]">
      <h1 className="text-center text-3xl md:text-6xl lg:text-3xl font-semibold text-[#1E88E5] mb-6">
        Login
      </h1>
      <form
        onSubmit={onSubmit}
        className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 relative"
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
            id="phoneNumberInput"
            minLength={10}
            maxLength={10}
            required
            className={`rounded-md border border-gray-400 mt-2 h-10 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg outline-blue-950 ${
              isPhoneInvalid && phoneNumber ? "outline-none border-red-500" : ""
            }`}
            placeholder="0912345678"
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          {phoneNumber && isPhoneInvalid && (
            <p className="text-sm text-red-500 mt-2">
              Phone Number should be exactly 10 in length
            </p>
          )}
        </div>
        <div className="relative">
          <label
            htmlFor="passwordInput"
            className="text-xl md:text-3xl lg:text-lg text-gray-800"
          >
            Password
          </label>{" "}
          <br />
          <button
            type="button"
            className="absolute top-[58%] right-4 text-blue-900 hover:cursor-pointer hover:border hover:rounded-4xl"
            onClick={() => setShowPassword((s) => !s)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            minLength={8}
            id="passwordInput"
            required
            className={`rounded-md border border-gray-400 h-10 md:h-14 lg:h-10 mt-2 w-full px-3 md:text-2xl outline-blue-950 ${
              isPasswordTooShort && password
                ? "outline-none border-red-500"
                : ""
            }`}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {password && isPasswordTooShort && (
          <p className="text-sm text-red-500 mt-2">
            Password should be atleast 8 in length
          </p>
        )}
        <div className="my-4 md:my-8 md:flex md:justify-between md:items-center lg:items-center">
          <label
            htmlFor="rememberMe"
            className="flex items-center text-lg md:text-2xl lg:text-lg mb-2"
          >
            <input
              type="checkbox"
              name="remember"
              id="rememberMe"
              value={`${rememberMe}`}
              onClick={() => setRememberMe((r) => !r)}
            />
            <p className="ml-2 text-gray-800">Remember me</p>
          </label>
          <a
            href="#"
            className="text-lg md:text-xl lg:text-lg hover:underline text-blue-800 font-semibold"
          >
            Forgot Password
          </a>
        </div>
        <div className="flex-col mt-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-400 h-10 md:h-14 lg:h-10 pb-0 mb-3 md:mb-4 text-white font-semibold md:text-3xl lg:text-xl hover:cursor-pointer hover:bg-blue-900"
          >
            {loading ? "Checking..." : "Login"}
          </button>
          <button
            type="button"
            className="w-full rounded-md border h-10 md:h-14 lg:h-10 border-gray-400 text-blue-900 font-semibold py-1 md:text-3xl lg:text-xl hover:cursor-pointer hover:bg-blue-900 hover:text-white"
            onClick={() => redirect("/auth/sign-up", RedirectType.push)}
          >
            Create Account
          </button>
        </div>
        <p className={`absolute text-lg text-red-500 right-8 bottom-0`}>
          {authError}
        </p>
      </form>
    </div>
  );
}
