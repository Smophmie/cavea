import { baseURL } from "@/api";
import { cacheService } from "./CacheService";
import NetInfo from '@react-native-community/netinfo';

const CACHE_KEYS = {
  TOTAL_STOCK: 'cache_total_stock',
  STOCK_BY_COLOUR: 'cache_stock_by_colour',
  LAST_ADDED: 'cache_last_added',
  ALL_ITEMS: 'cache_all_items',
  ITEMS_BY_COLOUR: 'cache_items_by_colour_'
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
      if (cachedData) {
        return cachedData;
      }
      throw error;
    }
  } else {
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    throw new Error('Aucune donnée en cache et pas de connexion');
  }
};

export const cellarService = {
  getTotalStock: async (token: string) => {
    return fetchWithCache(CACHE_KEYS.TOTAL_STOCK, async () => {
      const response = await fetch(`${baseURL}/cellar-items/total-stock`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du stock");
      }

      const data = await response.json();
      return data.total_stock;
    });
  },

  getStockByColour: async (token: string) => {
    return fetchWithCache(CACHE_KEYS.STOCK_BY_COLOUR, async () => {
      const response = await fetch(`${baseURL}/cellar-items/stock-by-colour`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du stock par couleur");
      }

      const data = await response.json();
      return data;
    });
  },

  getLastAdded: async (token: string) => {
    return fetchWithCache(CACHE_KEYS.LAST_ADDED, async () => {
      const response = await fetch(`${baseURL}/cellar-items/last`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des derniers ajouts");
      }

      const data = await response.json();
      return data;
    });
  },

  getAllCellarItems: async (token: string) => {
    return fetchWithCache(CACHE_KEYS.ALL_ITEMS, async () => {
      const response = await fetch(`${baseURL}/cellar-items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des bouteilles");
      }

      const data = await response.json();
      return data;
    });
  },

  getCellarItemsByColour: async (token: string, selectedColour: number | null) => {
    const cacheKey = `${CACHE_KEYS.ITEMS_BY_COLOUR}${selectedColour}`;
    return fetchWithCache(cacheKey, async () => {
      const response = await fetch(`${baseURL}/cellar-items/colour/${selectedColour}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des bouteilles");
      }

      const data = await response.json();
      return data;
    });
  },
  
  createCellarItem: async (token: string, formData: any) => {
    const response = await fetch(`${baseURL}/cellar-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la création");
    }

    const data = await response.json();
    return data;
  },

  updateCellarItem: async (token: string, cellarItemId: number, formData: any) => {
    const response = await fetch(`${baseURL}/cellar-items/${cellarItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la modification");
    }

    const data = await response.json();
    return data;
  },

  getCellarItem: async (token: string, cellarItemId: number) => {
    const response = await fetch(`${baseURL}/cellar-items/${cellarItemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la bouteille");
    }

    const data = await response.json();
    return data;
  },
};