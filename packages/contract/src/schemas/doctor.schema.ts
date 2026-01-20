export interface countPendingDoctorsRes {
  message: string;
  pendingDoctors: number;
}

export interface countHospitalDoctorsRes {
  status: "Success" | "Failed";
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
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface getHospitalDoctorApplicationsRes {
  message: string;
  status: "Success" | "Failed";
  data: {
    Applications: {
      Doctor: {
        User: {
          fullName: string;
          phoneNumber: string | null;
          gender: string | null;
          imageUrl: string | null;
        };
        DoctorSpecialization: {
          Specialization: {
            name: string;
          };
        };
      } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        yearsOfExperience: number | null;
        bio: string | null;
        isDeactivated: boolean;
      };
    } & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      status: string;
      doctorId: string;
      hospitalId: string;
    };
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

export interface approveHospitalDoctorRes {
  message: string;
  status: "Success" | "Failed";
  data: {
    profile: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      doctorId: string;
      hospitalId: string;
      slotDuration: number;
    };
  };
}

export interface approveHospitalDoctorBody {
  slotDuration: number;
  applicationId: string;
}

export interface rejectDoctorRes {
  status: "Success" | "Failed";
  message: string;
  data: {
    rejectedDoctor: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      status: string;
      doctorId: string;
      hospitalId: string;
    };
  };
}

export interface rejectHospitalDoctorBody {
  applicationId: string;
}

export interface getHospitalDoctorsRes {
  message: string;
  status: "Success" | "Failed";
  data: {
    doctors: {
      id: string;
      Doctor: {
        id: string;
        yearsOfExperience: number | null;
        User: {
          email: string | null;
          fullName: string;
          phoneNumber: string | null;
          imageUrl: string | null;
        };
      };
      slotDuration: number;
    }[];
    hospital: {
      id: string;
      name: string;
      logoUrl: string;
    };
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

export interface removeDoctorFromHospitalRes {
  message: string;
  status: "Success" | "Failed";
}
