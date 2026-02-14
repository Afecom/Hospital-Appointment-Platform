export interface countPendingAppointmentsRes {
  message: string;
  totalAppointments: number;
}

export interface doctorOverviewRes {
  message: string;
  status: "Success" | "Failed";
  data: {
    doctor: {
      fullName: string;
      specializations: string[];
    };
    today: any[];
    upcomingByDate: Record<string, any[]>;
    past: any[];
    counts: {
      today: number;
      upcoming: number;
      completed: number;
      cancelled: number;
    };
  };
}
