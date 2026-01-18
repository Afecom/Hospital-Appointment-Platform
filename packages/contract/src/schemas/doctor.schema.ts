export interface countPendingDoctorsRes {
  message: string;
  pendingDoctors: number;
}

export interface countHospitalDoctorsRes {
  message: string;
  total: number;
}

export interface inactiveHospitalDoctorsRes {
  inactiveDoctors: {
    id: string;
    Doctor: {
      id: string;
      User: {
        id: string;
        fullName: string;
        phoneNumber: string | null;
      };
    };
    slotDuration: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
