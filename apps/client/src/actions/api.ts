import api from "@/lib/axios";
import { DoctorApplication } from "@/lib/types";
export const getDoctorApplications = async (
  status: string
): Promise<DoctorApplication[]> => {
  try {
    const response = await api.get(
      `/doctor/hospital/application?status=${status}`
    );
    return response.data.data.Applications;
  } catch (error) {
    throw new Error(`Failed to fetch ${status} doctors`);
  }
};
