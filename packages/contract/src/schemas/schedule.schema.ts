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
