import Header from "./components/Header";
import Snapshot from "./components/Snapshot";
import TodayAppointments from "./components/TodayAppointments";
import UpcomingAppointments from "./components/UpcomingAppointments";
import PastAppointments from "./components/PastAppointments";
import DetailPanel from "./components/DetailPanel";
import type { Appointment } from "./components/types";

const mockToday: Appointment[] = [
  {
    id: "a1",
    date: "2026-02-10",
    start: "09:00",
    end: "09:20",
    patientName: "John Doe",
    patientAge: 36,
    patientGender: "M",
    reason: "Follow-up: blood pressure management",
    type: "In-person",
    status: "Approved",
    isNew: false,
  },
  {
    id: "a2",
    date: "2026-02-10",
    start: "09:30",
    end: "09:50",
    patientName: "Jane Smith",
    patientAge: 28,
    patientGender: "F",
    reason: "New patient consultation",
    type: "In-person",
    status: "Approved",
    isNew: true,
  },
];

const mockUpcomingByDate: Record<string, Appointment[]> = {
  "Monday – Feb 12": [
    {
      id: "u1",
      date: "2026-02-12",
      start: "10:00",
      end: "10:20",
      patientName: "Alice Green",
      patientAge: 45,
      patientGender: "F",
      reason: "Chest pain review",
      type: "In-person",
      status: "Approved",
    },
  ],
  "Tuesday – Feb 13": [
    {
      id: "u2",
      date: "2026-02-13",
      start: "14:00",
      end: "14:20",
      patientName: "Robert Brown",
      patientAge: 52,
      patientGender: "M",
      reason: "Medication review",
      type: "In-person",
      status: "Approved",
    },
  ],
};

const mockPast: Appointment[] = [
  {
    id: "p1",
    date: "2026-02-05",
    start: "11:00",
    end: "11:20",
    patientName: "Sam Wilson",
    patientAge: 60,
    patientGender: "M",
    reason: "Routine follow-up",
    type: "In-person",
    status: "Completed",
  },
];

export default function DoctorsAppointmentPage() {
  const doctorName = "Dr. Ayub Mussa";
  const specialization = "Cardiology";
  const dateContext = "Today";

  const counts = {
    today: mockToday.length,
    upcoming: Object.values(mockUpcomingByDate).flat().length,
    completed: mockPast.filter((p) => p.status === "Completed").length,
    cancelled: mockPast.filter((p) => p.status === "Cancelled").length,
  };

  return (
    <div className="p-6">
      <Header
        doctorName={doctorName}
        specialization={specialization}
        dateContext={dateContext}
      />
      <Snapshot
        today={counts.today}
        upcoming={counts.upcoming}
        completed={counts.completed}
        cancelled={counts.cancelled}
      />

      <main>
        <TodayAppointments appointments={mockToday} />
        <DetailPanel appt={mockToday[0]} />
        <UpcomingAppointments appointmentsByDate={mockUpcomingByDate} />
        <PastAppointments appointments={mockPast} />
      </main>
    </div>
  );
}
