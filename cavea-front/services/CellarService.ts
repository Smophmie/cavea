import { baseURL } from "@/api";
import { cacheService } from "./CacheService";
import NetInfo from '@react-native-community/netinfo';

const CACHE_KEYS = {
  TOTAL_STOCK: 'cache_total_stock',
  STOCK_BY_COLOUR: 'cache_stock_by_colour',
  LAST_ADDED: 'cache_last_added',
  ALL_ITEMS: 'cache_all_items',
  ITEMS_BY_COLOUR: 'cache_items_by_colour_'
} as const;

const CACHE_KEYS_TO_INVALIDATE = [
  CACHE_KEYS.TOTAL_STOCK,
  CACHE_KEYS.STOCK_BY_COLOUR,
  CACHE_KEYS.LAST_ADDED,
  CACHE_KEYS.ALL_ITEMS,
];

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const buildHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const fetchAPI = async (
  endpoint: string,
  token: string,
  method: HttpMethod = 'GET',
  body?: any,
  errorMessage?: string
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
    } catch {
      // Response body is not JSON or json() not available
    }
    throw new Error(errorData.message || errorMessage || `Erreur lors de l'opération ${method}`);
  }

  return response.json();
};

const fetchWithCache = async (
  cacheKey: string,
  fetchFn: () => Promise<any>
) => {
  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected ?? false;

  if (isOnline) {
    try {
      const data = await fetchFn();
      await cacheService.set(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Network error, trying cache:', error);
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) return cachedData;
      throw error;
    }
  } else {
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) return cachedData;
    throw new Error('Aucune donnée en cache et pas de connexion');
  }
};

const invalidateCaches = async () => {
  await Promise.all(
    CACHE_KEYS_TO_INVALIDATE.map(key => cacheService.clear(key))
  );
};

export const cellarService = {
  getTotalStock: async (token: string) => {
    return fetchWithCache(CACHE_KEYS.TOTAL_STOCK, async () => {
      const data = await fetchAPI('/cellar-items/total-stock', token);
      return data.total_stock;
    });
  },

  getStockByColour: async (token: string) => {
    return fetchWithCache(
      CACHE_KEYS.STOCK_BY_COLOUR,
      () => fetchAPI('/cellar-items/stock-by-colour', token)
    );
  },

  getLastAdded: async (token: string) => {
    return fetchWithCache(
      CACHE_KEYS.LAST_ADDED,
      () => fetchAPI('/cellar-items/last', token)
    );
  },

  getAllCellarItems: async (token: string) => {
    return fetchWithCache(
      CACHE_KEYS.ALL_ITEMS,
      () => fetchAPI('/cellar-items', token)
    );
  },

  getCellarItemsByColour: async (token: string, selectedColour: number | null) => {
    const cacheKey = `${CACHE_KEYS.ITEMS_BY_COLOUR}${selectedColour}`;
    return fetchWithCache(
      cacheKey,
      () => fetchAPI(`/cellar-items/colour/${selectedColour}`, token)
    );
  },
  
  createCellarItem: async (token: string, formData: any) => {
    const data = await fetchAPI('/cellar-items', token, 'POST', formData);
    await invalidateCaches();
    return data;
  },

  updateCellarItem: async (token: string, cellarItemId: number, formData: any) => {
    const data = await fetchAPI(`/cellar-items/${cellarItemId}`, token, 'PUT', formData);
    await invalidateCaches();
    return data;
  },

  getCellarItem: async (token: string, cellarItemId: number) => {
    return fetchAPI(
      `/cellar-items/${cellarItemId}`,
      token,
      'GET',
      undefined,
      'Erreur lors de la récupération de la bouteille'
    );
  },
};