import { baseURL } from "@/api";

type HttpMethod = "GET" | "DELETE";

const buildHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const fetchAPI = async (
  endpoint: string,
  token: string,
  method: HttpMethod = "GET",
  errorMessage?: string
) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method,
    headers: buildHeaders(token),
  });

  if (method === "DELETE" && response.status === 204) {
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(errorMessage || data.message || "Une erreur est survenue.");
  }

  return data;
};

export interface UserProfile {
  id: number;
  name: string;
  firstname: string;
  email: string;
}

export interface UserStats {
  total_stock: number;
  total_value: number | null;
  favourite_region: string | null;
}

class UserService {
  async getMe(token: string): Promise<UserProfile> {
    return fetchAPI("/user/me", token, "GET", "Impossible de récupérer les informations.");
  }

  async getStats(token: string): Promise<UserStats> {
    return fetchAPI("/user/stats", token, "GET", "Impossible de récupérer les statistiques.");
  }

  async deleteAccount(token: string): Promise<void> {
    return fetchAPI("/user", token, "DELETE", "Impossible de supprimer le compte.");
  }
}

export const userService = new UserService();
