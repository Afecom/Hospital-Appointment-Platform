"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Role } from "../../../../../generated/prisma/enums";
import { RoleHomePages } from "@/lib/redirect-config";

export default function completeProfile() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const DefaultRedirect = "/auth/login";
  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      let res;
      if (file) {
        const form = new FormData();
        form.append("fullName", fullName);
        form.append("email", email);
        form.append("dateOfBirth", dateOfBirth);
        form.append("password", password);
        form.append("gender", selectedValue);
        form.append("profilePicture", file);

        res = await api.patch("/user/complete-profile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const userData = {
          fullName: fullName,
          email: email,
          dateOfBirth: dateOfBirth,
          password: password,
          profilePicture: preview,
          gender: selectedValue,
        };
        res = await api.patch("/user/complete-profile", userData);
      }
      if (res?.data) {
        try {
          const sessionRes = await authClient.getSession();
          if (sessionRes.error) return router.replace(DefaultRedirect);
          if (sessionRes.data) {
            const role = sessionRes.data.user.role;
            const homePath = RoleHomePages[role as Role];
            return router.replace(homePath);
          }
        } catch (error) {
          return router.replace(DefaultRedirect);
        }
      }
    } catch (error: any) {
      console.log("error", error);
      const message =
        error?.response?.data?.message || error?.message || "Please try again";
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview(null);
    }
  };
  const isPasswordTooShort = password.length > 0 && password.length < 8;
  const passwordDoNotMatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  return (
    <div className="flex-col justify-center items-center md:w-[60%] lg:w-[35%] w-[70%]">
      <h1 className="text-center text-3xl md:text-6xl lg:text-3xl font-semibold text-[#1E88E5] mb-6">
        Complete Profile
      </h1>
      <form
        className="bg-white shadow-xl rounded-lg p-7 relative"
        onSubmit={submitHandler}
      >
        <div className="mb-4 md:flex items-center justify-between gap-10">
          <div className="">
            <label htmlFor="fullNameInput" className="md:text-xl">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              name="fullName"
              id="fullNameInput"
              className="rounded-md border border-gray-400 mt-2 h-8 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg outline-blue-950"
              required
            />
          </div>
          <div className="mt-4 md:mt-0">
            <label htmlFor="emailInput" className="md:text-xl">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email!}
              onChange={(e) => setEmail(e.target.value)}
              id="emailInput"
              className="rounded-md border border-gray-400 mt-2 h-10 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg outline-blue-950"
            />
          </div>
        </div>
        <div className="mb-4 md:flex md:items-center md:gap-10">
          <div className="">
            <label htmlFor="genderInput" className="md:text-xl">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              id="genderInput"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              required
              className="rounded-md border border-gray-400 mt-2 h-10 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg outline-blue-950"
            >
              <option value="" className="hidden">
                Select gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="mt-4 md:mt-0">
            <label htmlFor="DOBInput" className="md:text-xl">
              Date Of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={dateOfBirth!}
              onChange={(e) => setDateOfBirth(e.target.value)}
              id="DOBInput"
              className="rounded-md border border-gray-400 mt-2 h-8 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg outline-blue-950"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="profilePictureInput" className="md:text-xl">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            name="profilePicture"
            id="profilePictureInput"
            className="rounded-md border border-gray-400 mt-2 h-8 md:h-14 lg:h-10 w-full px-3 md:text-2xl lg:text-lg outline-blue-950"
            onChange={handleFileChange}
          />
          {preview && (
            <div className="mt-2">
              <p className="text-sm mb-2">Preview</p>
              <img
                src={preview}
                alt="avatar"
                className="w-24 h-24 object-cover rounded-full border border-blue-950"
              />
            </div>
          )}
        </div>
        <div className="relative mt-4">
          <label htmlFor="passwordInput" className="md:text-xl">
            Password <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            className="absolute top-[58%] right-4 text-blue-900 hover:cursor-pointer hover:border hover:rounded-4xl md:text-xl"
            onClick={() => setShowPassword((s) => !s)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="passwordInput"
            minLength={8}
            value={password}
            className={`rounded-md border border-gray-400 h-8 outline-blue-950 md:h-14 lg:h-10 mt-2 w-full px-3 md:text-2xl`}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {password && isPasswordTooShort && (
          <p className="text-red-500 text-sm mt-2">Minimum length is 8</p>
        )}
        <div className="relative mt-4">
          <label htmlFor="confirmPasswordInput" className="md:text-xl">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            className="absolute top-[58%] right-4 text-blue-900 hover:cursor-pointer hover:border hover:rounded-4xl md:text-xl"
            onClick={() => setShowPassword((s) => !s)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            id="confirmPasswordInput"
            minLength={8}
            className={`rounded-md border border-gray-400 h-8 outline-blue-950 md:h-14 lg:h-10 mt-2 w-full px-3 md:text-2xl`}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {password && passwordDoNotMatch && (
          <p className="text-red-500 text-sm mt-2">Passwords Do Not Match</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 md:mt-5 rounded-md bg-green-400 h-10 md:h-14 lg:h-10 text-white font-semibold md:text-3xl lg:text-xl hover:cursor-pointer hover:bg-blue-900"
        >
          {loading ? "submitting..." : "complete"}
        </button>
        <p className={`absolute text-lg text-red-500 right-8 bottom-0`}>
          {authError}
        </p>
      </form>
    </div>
  );
}
