"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ShimmerCard from "@/components/shared/ui/ShimmerCard";
import Modal from "@/components/shared/layout/Modal";
import { useToast } from "@/context/ToastContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Tabs from "@/components/shared/ui/Tabs";
import { getDoctorApplications } from "@/actions/api";
import { DoctorApplication } from "@/lib/types";
import api from "@/lib/axios";

const DoctorApplicationsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "pending";

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    data: DoctorApplication | null;
  }>({
    isOpen: false,
    type: null,
    data: null,
  });

  const [slotDuration, setSlotDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const {
    data: applications = [],
    isLoading,
    isError,
  } = useQuery<DoctorApplication[]>({
    queryKey: ["doctorApplications", status],
    queryFn: () => getDoctorApplications(status),
  });

  const tabs = useMemo(
    () => [
      { label: "Pending", value: "pending" },
      { label: "Approved", value: "approved" },
      { label: "Rejected", value: "rejected" },
    ],
    []
  );

  if (isError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4">
        <p className="text-lg text-red-600">
          Failed to load doctor applications.
        </p>
      </div>
    );
  }

  const openModal = (type: "approve" | "reject", data: DoctorApplication) => {
    setModalState({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, data: null });
  };

  const handleTabClick = (tab: string) => {
    router.push(`${pathname}?status=${tab}`);
  };

  const handleApprove = async () => {
    if (!modalState.data) return;
    setIsSubmitting(true);
    try {
      await api.patch("/doctor/hospital/approve", {
        applicationId: modalState.data.id,
        slotDuration: slotDuration,
      });
      addToast({ type: "success", message: "Doctor approved successfully" });
      queryClient.invalidateQueries({
        queryKey: ["doctorApplications", status],
      });
      closeModal();
    } catch (error) {
      addToast({ type: "error", message: "Failed to approve doctor" });
      throw new Error("Failed to approve doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!modalState.data) return;
    setIsSubmitting(true);
    try {
      await api.patch("/doctor/hospital/reject", {
        applicationId: modalState.data.id,
      });
      addToast({ type: "success", message: "Doctor rejected successfully" });
      queryClient.invalidateQueries({
        queryKey: ["doctorApplications", status],
      });
      closeModal();
    } catch (error) {
      addToast({ type: "error", message: "Failed to reject doctor" });
      console.error("Failed to reject doctor", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4">
      <div className="max-w-6xl w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Applications
          </h1>
          <p className="text-lg text-gray-600">
            Review and manage incoming doctor applications.
          </p>
        </div>
        <Tabs tabs={tabs} activeTab={status} onTabClick={handleTabClick} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <ShimmerCard key={index} />
              ))
            : applications.length > 0
              ? applications.map((app: DoctorApplication) => (
                  <div
                    key={app.id}
                    className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-2 text-gray-800">
                        Dr. {app.Doctor.User.fullName}
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
                      {status === "pending" && (
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => openModal("approve", app)}
                            className="px-4 py-2 rounded-md bg-secondary text-white font-semibold hover:bg-blue-950 hover:cursor-pointer transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openModal("reject", app)}
                            className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-800 hover:cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              : !isLoading && (
                  <div className="col-span-full text-center">
                    <p className="text-lg text-gray-600">
                      No {status} applications at the moment.
                    </p>
                  </div>
                )}
        </div>
      </div>

      {modalState.isOpen && (
        <Modal
          onClose={closeModal}
          title={
            modalState.type === "approve"
              ? "Approve Doctor Application"
              : "Reject Doctor Application"
          }
        >
          {modalState.type === "approve" && (
            <div>
              <p>
                Set the slot duration for Dr.{" "}
                {modalState.data?.Doctor.User.fullName}.
              </p>
              <div className="mt-4">
                <label
                  htmlFor="slotDuration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slot Duration (in minutes)
                </label>
                <input
                  type="number"
                  id="slotDuration"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-secondary text-white hover:bg-blue-950 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
          {modalState.type === "reject" && (
            <div>
              <p>
                Are you sure you want to reject the application of Dr.{" "}
                {modalState.data?.Doctor.User.fullName}?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-800 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default DoctorApplicationsPage;
