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
