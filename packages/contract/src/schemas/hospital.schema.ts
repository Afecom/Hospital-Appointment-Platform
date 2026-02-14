export interface uniqueHospital {
  message: string;
  status: string;
  data: {
    name: string;
    slogan: string | null;
    logoUrl: string;
  };
}

export interface doctorHospital {
  message: string;
  status: string;
  data: {
    id: any;
    hospitalName: any;
    location: any;
    slotDuration: string;
    workingTime: string;
    activeSchedulesCount: number;
    startDate: string;
  }[];
}
