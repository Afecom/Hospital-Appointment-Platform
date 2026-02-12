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
    Hospital: {
      id: string;
      name: string;
    };
  }[];
}
