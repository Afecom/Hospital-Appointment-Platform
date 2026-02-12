"use server";

import api from "@/lib/axios";
export const applyScehdule = async (data: any) => {
  try {
    const response = await api.post("/schedule/apply", data);
    return response.data;
  } catch (error) {}
};
