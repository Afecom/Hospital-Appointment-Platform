export interface DoctorApplication {
    id: string;
    status: "pending" | "approved" | "rejected";
    Doctor: {
      id: string;
      yearsOfExperience: number;
      User: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        gender: string;
      };
      DoctorSpecialization: {
        Specialization: {
          name: string;
        };
      }[];
    };
  }
  