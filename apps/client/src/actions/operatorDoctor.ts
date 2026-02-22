import api from "@/lib/axios";
import type {
  OperatorDoctor,
  OperatorDoctorsOverviewResponse,
} from "@/app/(protected)/hospital-operator/doctor/types";

export async function fetchOperatorDoctorsOverview(
  date: string,
): Promise<OperatorDoctor[]> {
  try {
    const response = await api.get<OperatorDoctorsOverviewResponse>(
      `/doctor/operator?date=${encodeURIComponent(date)}`,
    );
    return response.data?.data?.doctors ?? [];
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = "Failed to fetch operator doctors";

    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message)) message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }

    throw new Error(message);
  }
}
