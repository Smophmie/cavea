import { cellarService } from '../CellarService';

global.fetch = jest.fn();

describe('CellarService - New Methods', () => {
  const mockToken = 'test-token';
  const mockBottleId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCellarItemById', () => {
    it('should fetch bottle details by id', async () => {
      const mockBottleData = {
        id: 1,
        bottle: {
          name: 'Test Wine',
          domain: { name: 'Test Domain' },
          grape_varieties: [{ id: 1, name: 'Merlot' }],
        },
        vintage: { year: 2020 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBottleData,
        status: 200,
        statusText: 'OK',
      });

      const result = await cellarService.getCellarItemById(mockToken, mockBottleId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );

      expect(result).toEqual(mockBottleData);
    });

    it('should handle errors when fetching bottle details', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Bottle not found' }),
      });

      await expect(
        cellarService.getCellarItemById(mockToken, mockBottleId)
      ).rejects.toThrow();
    });
  });

  describe('deleteCellarItem', () => {
    it('should send a DELETE request and return null on 204', async () => {
      const jsonSpy = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        json: jsonSpy,
      });

      const result = await cellarService.deleteCellarItem(mockToken, mockBottleId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toBeNull();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('should handle errors when deleting', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Not authorized' }),
      });

      await expect(
        cellarService.deleteCellarItem(mockToken, mockBottleId)
      ).rejects.toThrow();
    });
  });

  describe('updateCellarItem', () => {
    it('should update a cellar item', async () => {
      const mockFormData = {
        stock: 5,
        rating: 8,
        price: 30,
      };

      const mockUpdatedData = {
        id: 1,
        ...mockFormData,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdatedData,
        status: 200,
        statusText: 'OK',
      });

      const result = await cellarService.updateCellarItem(
        mockToken,
        mockBottleId,
        mockFormData
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockFormData),
        })
      );

      expect(result).toEqual(mockUpdatedData);
    });

    it('should handle validation errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          message: 'Validation failed',
          errors: {
            rating: ['Rating must be between 0 and 10'],
          },
        }),
      });

      await expect(
        cellarService.updateCellarItem(mockToken, mockBottleId, { rating: 15 })
      ).rejects.toThrow();
    });
  });
});
// ─── Mocks ────────────────────────────────────────────────────────────────────
// Factories must be self-contained: jest.mock() is hoisted before imports by
// Babel, so any variable declared in this file is undefined at factory
// execution time. Instead, we mock with inline implementations and retrieve
// the mocked modules via jest.mocked() inside the tests.

jest.mock('../CacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

describe('CellarService - Cache & remaining methods', () => {
  const mockToken = 'test-token';

  // Retrieve the mocked instances after module resolution
  const { cacheService } = jest.requireMock('../CacheService') as {
    cacheService: { get: jest.Mock; set: jest.Mock; clear: jest.Mock };
  };
  const NetInfo = jest.requireMock('@react-native-community/netinfo') as {
    fetch: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: online, empty cache
    NetInfo.fetch.mockResolvedValue({ isConnected: true });
    cacheService.get.mockResolvedValue(null);
    cacheService.set.mockResolvedValue(undefined);
    cacheService.clear.mockResolvedValue(undefined);
  });

  // ─── fetchWithCache behaviour ───────────────────────────────────────────────

  describe('fetchWithCache — offline fallback', () => {
    it('should return cached data when offline', async () => {
      NetInfo.fetch.mockResolvedValue({ isConnected: false });
      cacheService.get.mockResolvedValue([{ id: 1 }]);

      const result = await cellarService.getAllCellarItems(mockToken);

      expect(result).toEqual([{ id: 1 }]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw when offline and no cache available', async () => {
      NetInfo.fetch.mockResolvedValue({ isConnected: false });
      cacheService.get.mockResolvedValue(null);

      await expect(cellarService.getAllCellarItems(mockToken)).rejects.toThrow(
        'Aucune donnée en cache et pas de connexion'
      );
    });

    it('should fall back to cache when the network request fails while online', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      cacheService.get.mockResolvedValue([{ id: 42 }]);

      const result = await cellarService.getAllCellarItems(mockToken);

      expect(result).toEqual([{ id: 42 }]);
    });

    it('should throw when online, network fails, and cache is empty', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      cacheService.get.mockResolvedValue(null);

      await expect(cellarService.getAllCellarItems(mockToken)).rejects.toThrow();
    });

    it('should write fresh data to cache after a successful fetch', async () => {
      const mockData = [{ id: 1 }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
      });

      await cellarService.getAllCellarItems(mockToken);

      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('cache_all_items'),
        mockData
      );
    });
  });

  // ─── getTotalStock ──────────────────────────────────────────────────────────

  describe('getTotalStock', () => {
    it('should return the total stock value', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ total_stock: 42 }),
      });

      const result = await cellarService.getTotalStock(mockToken);

      expect(result).toBe(42);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/total-stock'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  // ─── getStockByColour ───────────────────────────────────────────────────────

  describe('getStockByColour', () => {
    it('should return stock grouped by colour', async () => {
      const mockData = [
        { colour: 'Rouge', stock: 10 },
        { colour: 'Blanc', stock: 5 },
      ];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
      });

      const result = await cellarService.getStockByColour(mockToken);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/stock-by-colour'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  // ─── getLastAdded ───────────────────────────────────────────────────────────

  describe('getLastAdded', () => {
    it('should return the last added items', async () => {
      const mockData = [{ id: 9 }, { id: 8 }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
      });

      const result = await cellarService.getLastAdded(mockToken);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/last'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  // ─── getAllCellarItems ──────────────────────────────────────────────────────

  describe('getAllCellarItems', () => {
    it('should return all cellar items', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
      });

      const result = await cellarService.getAllCellarItems(mockToken);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  // ─── getCellarItemsByColour ─────────────────────────────────────────────────

  describe('getCellarItemsByColour', () => {
    it('should filter items by colour id', async () => {
      const mockData = [{ id: 3 }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
      });

      const result = await cellarService.getCellarItemsByColour(mockToken, 2);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/colour/2'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should use a colour-specific cache key', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => [],
      });

      await cellarService.getCellarItemsByColour(mockToken, 5);

      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('cache_items_by_colour_5'),
        expect.anything()
      );
    });
  });

  // ─── createCellarItem ───────────────────────────────────────────────────────

  describe('createCellarItem', () => {
    const formData = {
      bottle: { name: 'Test', domain_name: 'Dom', colour_id: 1, region_id: 1 },
      vintage: { year: 2020 },
      stock: 2,
    };

    it('should POST and return the created item', async () => {
      const mockCreated = { id: 10, ...formData };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => mockCreated,
      });

      const result = await cellarService.createCellarItem(mockToken, formData);

      expect(result).toEqual(mockCreated);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(formData),
        })
      );
    });

    it('should invalidate caches after creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => ({ id: 10 }),
      });

      await cellarService.createCellarItem(mockToken, formData);

      expect(cacheService.clear).toHaveBeenCalledTimes(4);
    });

    it('should rethrow errors without invalidating caches', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({ message: 'Validation failed' }),
      });

      await expect(cellarService.createCellarItem(mockToken, formData)).rejects.toThrow();
      expect(cacheService.clear).not.toHaveBeenCalled();
    });
  });

  // ─── getCellarItem ──────────────────────────────────────────────────────────

  describe('getCellarItem', () => {
    it('should fetch a single item by id (alias of getCellarItemById)', async () => {
      const mockData = { id: 7 };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
      });

      const result = await cellarService.getCellarItem(mockToken, 7);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/7'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });
});