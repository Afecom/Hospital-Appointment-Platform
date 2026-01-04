"use client";

import { useState } from "react";
import Modal from "@/components/shared/layout/Modal";
import { Eye, Pencil, Trash } from "lucide-react";
import api from "@/lib/axios";
import { useQueries } from "@tanstack/react-query";
const MOCK_DOCTORS = Array.from({ length: 10 }).map((_, i) => ({
  id: `doc-${i + 1}`,
  fullName: `Dr. John Doe ${i + 1}`,
  specialization: i % 2 === 0 ? "Cardiologist" : "Dermatologist",
  email: `john.doe${i + 1}@hospital.com`,
  phone: `+1 234 567 890${i}`,
  imageUrl: `https://i.pravatar.cc/150?u=${i}`,
  bio: "Experienced specialist with over 10 years of practice in top-tier hospitals. Dedicated to patient care and continuous learning.",
  yearsOfExperience: 5 + i,
}));

const fetchDoctors = async (): Promise<any> => {
  try {
    const res = await api.get("/doctor/hospital");
    return res.data;
  } catch (error) {
    throw new Error("Failed to fetch doctors.");
  }
};

export default function DoctorsListPage() {
  const result = useQueries({
    queries: [
      {
        queryKey: ["doctors"],
        queryFn: fetchDoctors,
      },
    ],
  }) as any[];
  let totalDoctors: any[] = [];
  const [doctorsData] = result;
  totalDoctors = doctorsData?.data?.doctors ?? [];

  const [doctors, setDoctors] = useState(totalDoctors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (doc: any) => {
    setSelectedDoctor(doc);
    setViewModalOpen(true);
  };

  const handleEdit = (doc: any) => {
    setSelectedDoctor(doc);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (doc: any) => {
    setSelectedDoctor(doc);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setDoctors((prev) => prev.filter((d) => d.id !== selectedDoctor.id));
    setDeleteModalOpen(false);
    setSelectedDoctor(null);
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
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={doctor.imageUrl}
                alt={doctor.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {doctor.fullName}
                </h3>
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
              </div>
            </div>

            <div className="grow">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Email:</span> {doctor.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> {doctor.phone}
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
                onClick={() => handleEdit(doctor)}
                className="p-2 text-secondary hover:bg-blue-50 rounded-md transition-colors"
                title="Edit"
              >
                <Pencil className="w-5 h-5" />
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

      {/* View Modal */}
      {viewModalOpen && selectedDoctor && (
        <Modal onClose={() => setViewModalOpen(false)} title="Doctor Details">
          <div className="flex flex-col items-center mb-6">
            <img
              src={selectedDoctor.imageUrl}
              alt={selectedDoctor.fullName}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary"
            />
            <h2 className="text-xl font-bold text-gray-800">
              {selectedDoctor.fullName}
            </h2>
            <p className="text-secondary font-medium">
              {selectedDoctor.specialization}
            </p>
          </div>
          <div className="space-y-3">
            <p>
              <strong>Email:</strong> {selectedDoctor.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedDoctor.phone}
            </p>
            <p>
              <strong>Experience:</strong> {selectedDoctor.yearsOfExperience}{" "}
              years
            </p>
            <div>
              <strong>Bio:</strong>
              <p className="text-gray-600 mt-1">{selectedDoctor.bio}</p>
            </div>
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

      {/* Edit Modal (Mock Form) */}
      {editModalOpen && selectedDoctor && (
        <Modal onClose={() => setEditModalOpen(false)} title="Edit Doctor">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setEditModalOpen(false);
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={selectedDoctor.fullName}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <input
                type="text"
                defaultValue={selectedDoctor.specialization}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </form>
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
            <strong>{selectedDoctor.fullName}</strong>? This action cannot be
            undone.
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
