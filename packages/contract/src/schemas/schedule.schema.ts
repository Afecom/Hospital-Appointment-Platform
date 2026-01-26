export interface countPendingSchedulesRes {
  status: "Success" | "Failed";
  message: string;
  total: number;
}

export interface countActiveSchedulesRes {
  status: "Success" | "Failed";
  message: string;
  total: number;
}

export interface getScheduleForAdminRes {
  status: "Success" | "Failed";
  message: string;
  data: {
    schedules: {
      type: string;
      id: string;
      name: string;
      Doctor: {
        id: string;
        User: {
          fullName: string;
          phoneNumber: string | null;
        };
      };
      dayOfWeek: number[];
      startDate: string;
      endDate: string | null;
      startTime: string;
      endTime: string;
      status: string;
      period: string;
    }[];
    meta: {
      total: number;
      page: number;
      limit: number;
      lastPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface approveScheduleRes {
  status: "Success" | "Failed";
  message: string;
}

export interface scheduleApplicationSchedule {
  type: string;
  id: string;
  name: string;
  Doctor: {
    id: string;
    User: {
      fullName: string;
      phoneNumber: string | null;
    };
  };
  dayOfWeek: number[];
  startDate: string;
  endDate: string | null;
  startTime: string;
  endTime: string;
  status: string;
  period: string;
}

export interface scheduleActionApiError {
  message: string;
  code: string;
  appointments: {
    id: string;
    Slot: {
      id: string;
      date: Date;
      slotStart: Date;
      slotEnd: Date;
    } | null;
  }[];
}
