"use client";

import React, { use } from "react";
import api from "@/lib/axios";
import { useQueries } from "@tanstack/react-query";

// Mock data for doctor applications

const pendingDoctors = async () => {
  try {
    const pendingDocsData = await api.get("/doctor/hospital/pending");
    return pendingDocsData.data.pendingHospitalDoctors;
  } catch (error) {
    throw new Error("Failed to fetch pending doctors");
  }
};

const DoctorApplicationsPage = () => {
  const result = useQueries({
    queries: [
      {
        queryKey: ["pendingDoctors"],
        queryFn: pendingDoctors,
      },
    ],
  });

  const [totalPendingDoctorsRes] = result;
  const totalPendingDoctors: any[] = totalPendingDoctorsRes?.data || [];

  const handleApprove = (id: string) => {
    console.log(`Approved doctor with id: ${id}`);
  };

  const handleReject = (id: string) => {
    console.log(`Rejected doctor with id: ${id}`);
  };

  return (
    <div className="h-full w-full flex flex-col p-4">
      <div className="max-w-6xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Applications
          </h1>
          <p className="text-lg text-gray-600">
            Review and manage incoming doctor applications.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {totalPendingDoctors.map((app: any) => (
            <div
              key={app.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {app.Doctor.User.fullName}
                </h2>
                <div className="text-gray-600 space-y-2 mb-4">
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {app.Doctor.User.gender}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {app.Doctor.User.phoneNumber}
                  </p>
                  <p>
                    <span className="font-medium">Experience:</span>{" "}
                    {app.Doctor.yearsOfExperience} years
                  </p>
                  <div>
                    <span className="font-medium">Specializations:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {app.Doctor.DoctorSpecialization.map(
                        (
                          spec: {
                            Specialization: {
                              name: string;
                            };
                          },
                          index: number
                        ) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                          >
                            {spec.Specialization.name}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button className="px-4 py-2 rounded-md bg-secondary text-white font-semibold hover:bg-blue-950 hover:cursor-pointer transition-colors">
                    Approve
                  </button>
                  <button className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-800 hover:cursor-pointer transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorApplicationsPage;
