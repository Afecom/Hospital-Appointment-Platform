"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import Modal from "@/components/shared/layout/Modal";
import { Trash, Eye } from "lucide-react";
import DoctorCardSkeleton from "@/components/shared/DoctorCardSkeleton";

const fetchDoctors = async (): Promise<any> => {
  try {
    const res = await api.get("/doctor/hospital");
    return res.data;
  } catch (error) {
    throw new Error("Failed to fetch doctors.");
  }
};

export default function DoctorsListPage() {
  const queryClient = useQueryClient();
  const {
    data: doctorsRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: (doctorId: string) => {
      return api.delete(`/doctor?doctorId=${doctorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      console.error("Failed to delete doctor:", error);
    },
  });

  const doctors = doctorsRes?.data?.doctors || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const filteredDoctors = doctors.filter(
    (doctor: any) =>
      doctor &&
      doctor.Doctor &&
      doctor.Doctor.User &&
      doctor.Doctor.User.fullName &&
      doctor.Doctor.User.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleView = (doc: any) => {
    setSelectedDoctor(doc);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (doc: any) => {
    setSelectedDoctor(doc);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDoctor) {
      deleteDoctorMutation.mutate(selectedDoctor.Doctor.id);
    }
    setDeleteModalOpen(false);
    setSelectedDoctor(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <DoctorCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center text-red-500">
          Error:{" "}
          {error instanceof Error ? error.message : "Failed to fetch doctors."}
        </div>
      );
    }

    if (filteredDoctors.length === 0) {
      return <div className="text-center text-gray-500">No doctors found.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor: any) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={doctor.Doctor.User.imageUrl}
                alt={doctor.Doctor.User.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  Dr. {doctor.Doctor.User.fullName}
                </h3>
              </div>
            </div>

            <div className="grow">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Email:</span>{" "}
                {doctor.Doctor.User.email}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Phone:</span>{" "}
                {doctor.Doctor.User.phoneNumber}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Slot Duration:</span>{" "}
                {doctor.slotDuration} minutes
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleView(doctor)}
                className="p-2 text-primary hover:bg-blue-50 rounded-md transition-colors"
                title="View Details"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(doctor)}
                className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-sm"
                title="Delete"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold text-primary text-center mb-4 md:mb-0">
          Doctors List
        </h1>
        <input
          type="text"
          placeholder="Search doctors by name..."
          className="w-full md:w-auto p-2 border border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading || isError}
        />
      </div>

      {renderContent()}

      {viewModalOpen && selectedDoctor && (
        <Modal onClose={() => setViewModalOpen(false)} title="Doctor Details">
          <div className="flex flex-col items-center mb-6">
            <img
              src={selectedDoctor.Doctor.User.imageUrl}
              alt={selectedDoctor.Doctor.User.fullName}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary"
            />
            <h2 className="text-xl font-bold text-gray-800">
              Dr. {selectedDoctor.Doctor.User.fullName}
            </h2>
          </div>
          <div className="space-y-3">
            <p>
              <strong>Email:</strong> {selectedDoctor.Doctor.User.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedDoctor.Doctor.User.phoneNumber}
            </p>
            <p>
              <strong>Experience:</strong>{" "}
              {selectedDoctor.Doctor.yearsOfExperience} years
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-black transition-all"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedDoctor && (
        <Modal
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <strong>Dr. {selectedDoctor.Doctor.User.fullName}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
