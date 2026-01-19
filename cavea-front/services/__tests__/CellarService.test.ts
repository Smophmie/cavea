import NetInfo from '@react-native-community/netinfo';
import { cellarService } from '../CellarService';
import { cacheService } from '../CacheService';

// Mock fetch globally
global.fetch = jest.fn();

jest.mock('../CacheService');

describe('CellarService', () => {
  const mockToken = 'test-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  describe('getTotalStock', () => {
    it('should fetch total stock when online and cache the result', async () => {
      const mockData = { total_stock: 156 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await cellarService.getTotalStock(mockToken);

      expect(result).toBe(156);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/total-stock'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(cacheService.set).toHaveBeenCalledWith('cache_total_stock', 156);
    });

    it('should use cache when offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
      (cacheService.get as jest.Mock).mockResolvedValueOnce(120);

      const result = await cellarService.getTotalStock(mockToken);

      expect(result).toBe(120);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(cacheService.get).toHaveBeenCalledWith('cache_total_stock');
    });

    it('should fallback to cache when network request fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      (cacheService.get as jest.Mock).mockResolvedValueOnce(100);

      const result = await cellarService.getTotalStock(mockToken);

      expect(result).toBe(100);
      expect(cacheService.get).toHaveBeenCalledWith('cache_total_stock');
    });

    it('should throw error when offline and no cache available', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
      (cacheService.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(cellarService.getTotalStock(mockToken)).rejects.toThrow(
        'Aucune donnée en cache et pas de connexion'
      );
    });

    it('should throw error when API returns non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(cellarService.getTotalStock(mockToken)).rejects.toThrow();
    });
  });

  describe('getStockByColour', () => {
    it('should fetch stock by colour when online', async () => {
      const mockData = [
        { colour: 'Rouge', stock: 25 },
        { colour: 'Blanc', stock: 15 },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await cellarService.getStockByColour(mockToken);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/stock-by-colour'),
        expect.any(Object)
      );
      expect(cacheService.set).toHaveBeenCalledWith('cache_stock_by_colour', mockData);
    });

    it('should use cached data when offline', async () => {
      const cachedData = [{ colour: 'Rouge', stock: 30 }];
      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
      (cacheService.get as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await cellarService.getStockByColour(mockToken);

      expect(result).toEqual(cachedData);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('getLastAdded', () => {
    it('should fetch last added items when online', async () => {
      const mockData = [
        {
          id: 1,
          stock: 3,
          bottle: { name: 'Test Wine', domain: 'Test Domain' },
        },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await cellarService.getLastAdded(mockToken);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/last'),
        expect.any(Object)
      );
    });
  });

  describe('getAllCellarItems', () => {
    it('should fetch all cellar items when online', async () => {
      const mockData = [
        { id: 1, bottle: { name: 'Wine 1' } },
        { id: 2, bottle: { name: 'Wine 2' } },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await cellarService.getAllCellarItems(mockToken);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items'),
        expect.any(Object)
      );
      expect(cacheService.set).toHaveBeenCalledWith('cache_all_items', mockData);
    });

    it('should include authorization header', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await cellarService.getAllCellarItems(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });
  });

  describe('getCellarItemsByColour', () => {
    it('should fetch items filtered by colour', async () => {
      const colourId = 1;
      const mockData = [{ id: 1, bottle: { name: 'Red Wine' } }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await cellarService.getCellarItemsByColour(mockToken, colourId);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/cellar-items/colour/${colourId}`),
        expect.any(Object)
      );
      expect(cacheService.set).toHaveBeenCalledWith(
        `cache_items_by_colour_${colourId}`,
        mockData
      );
    });

    it('should use different cache keys for different colours', async () => {
      const mockData = [{ id: 1 }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      await cellarService.getCellarItemsByColour(mockToken, 1);
      await cellarService.getCellarItemsByColour(mockToken, 2);

      expect(cacheService.set).toHaveBeenCalledWith('cache_items_by_colour_1', mockData);
      expect(cacheService.set).toHaveBeenCalledWith('cache_items_by_colour_2', mockData);
    });

    it('should handle null colour id', async () => {
      const mockData = [{ id: 1 }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await cellarService.getCellarItemsByColour(mockToken, null);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/colour/null'),
        expect.any(Object)
      );
    });
  });

  describe('Network resilience', () => {
    it('should retry with cache when API is temporarily unavailable', async () => {
      const cachedData = { total_stock: 50 };
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Timeout'));
      (cacheService.get as jest.Mock).mockResolvedValueOnce(50);

      const result = await cellarService.getTotalStock(mockToken);

      expect(result).toBe(50);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should throw when both network and cache fail', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      (cacheService.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(cellarService.getTotalStock(mockToken)).rejects.toThrow();
    });
  });

  describe('Cache behavior', () => {
    it('should always cache successful responses', async () => {
      const mockData = { total_stock: 200 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await cellarService.getTotalStock(mockToken);

      expect(cacheService.set).toHaveBeenCalledWith('cache_total_stock', 200);
    });

    it('should not cache failed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(cellarService.getTotalStock(mockToken)).rejects.toThrow();
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });
});