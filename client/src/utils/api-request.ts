import { ApiResponse } from "@/types/utils-interfaces";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/";

export const ApiRequest = async <T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Unknown error");
  }
};
