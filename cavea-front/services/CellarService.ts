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
  const requestUrl = `${baseURL}${endpoint}`;
  const requestHeaders = buildHeaders(token);

  console.log(`[FETCH_API] ${method} request to ${requestUrl}`, {
    endpoint,
    method,
    headers: {
      ...requestHeaders,
      Authorization: requestHeaders.Authorization ? 'Bearer ***' : undefined,
    },
    body: body ? JSON.stringify(body, null, 2) : undefined,
  });

  try {
    const response = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
    });

    console.log(`[FETCH_API] ${method} response from ${requestUrl}`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
        console.error(`[FETCH_API] ${method} error response body:`, errorData);
      } catch (e) {
        console.error(`[FETCH_API] ${method} could not parse error response as JSON`, e);
      }

      const error = new Error(errorData.message || errorMessage || `Erreur lors de l'opération ${method}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const responseData = await response.json();
    console.log(`[FETCH_API] ${method} success response:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`[FETCH_API] ${method} request failed:`, {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
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
    console.log('[CELLAR_SERVICE] Creating cellar item', {
      formData,
      timestamp: new Date().toISOString(),
    });

    try {
      const data = await fetchAPI('/cellar-items', token, 'POST', formData);

      console.log('[CELLAR_SERVICE] Cellar item created successfully', {
        cellarItem: data,
        timestamp: new Date().toISOString(),
      });

      console.log('[CELLAR_SERVICE] Invalidating caches');
      await invalidateCaches();
      console.log('[CELLAR_SERVICE] Caches invalidated successfully');

      return data;
    } catch (error) {
      console.error('[CELLAR_SERVICE] Failed to create cellar item', {
        error: error instanceof Error ? error.message : String(error),
        formData,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
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