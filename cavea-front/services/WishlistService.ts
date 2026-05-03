import { baseURL } from "@/api";

type HttpMethod = 'GET' | 'POST' | 'DELETE';

const buildHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const fetchAPI = async (
  endpoint: string,
  token: string,
  method: HttpMethod = 'GET',
  body?: any,
) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method,
    headers: buildHeaders(token),
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (_) {}
    const error = new Error(errorData.message || `Erreur ${method} ${endpoint}`);
    (error as any).response = { status: response.status, data: errorData };
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
};

export interface WishlistBottleData {
  bottle: {
    name: string;
    domain_name: string;
    colour_id: number;
    region_id: number;
    grape_variety_ids?: number[];
  };
  vintage: {
    year: number;
  };
  appellation_name?: string;
}

export const wishlistService = {
  getWishlistItems: (token: string) =>
    fetchAPI('/wishlist-items', token),

  getWishlistItemById: (token: string, id: number) =>
    fetchAPI(`/wishlist-items/${id}`, token),

  createWishlistItem: (token: string, data: WishlistBottleData) =>
    fetchAPI('/wishlist-items', token, 'POST', data),

  deleteWishlistItem: (token: string, id: number) =>
    fetchAPI(`/wishlist-items/${id}`, token, 'DELETE'),
};
