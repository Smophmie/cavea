import { cellarService } from '../CellarService';
import { baseURL } from '@/api';

global.fetch = jest.fn();

const mockToken = 'mock-token-123';

describe('CellarService - getStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return stats with all values filled', async () => {
    const mockStats = { total_stock: 42, total_value: 1250.5, favourite_region: 'Bordeaux' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: jest.fn().mockReturnValue(null) },
      json: async () => mockStats,
    });

    const result = await cellarService.getStats(mockToken);

    expect(result).toEqual(mockStats);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/cellar-items/stats`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should return stats with null total_value when no prices set', async () => {
    const mockStats = { total_stock: 10, total_value: null, favourite_region: 'Bourgogne' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: jest.fn().mockReturnValue(null) },
      json: async () => mockStats,
    });

    const result = await cellarService.getStats(mockToken);

    expect(result.total_value).toBeNull();
  });

  it('should return stats with null favourite_region when cellar is empty', async () => {
    const mockStats = { total_stock: 0, total_value: null, favourite_region: null };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: jest.fn().mockReturnValue(null) },
      json: async () => mockStats,
    });

    const result = await cellarService.getStats(mockToken);

    expect(result.total_stock).toBe(0);
    expect(result.favourite_region).toBeNull();
  });

  it('should throw on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(cellarService.getStats(mockToken)).rejects.toThrow(
      'Impossible de récupérer les statistiques.'
    );
  });
});

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
        headers: { get: jest.fn().mockReturnValue(null) },
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
    it('should delete a cellar item', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        status: 204,
        statusText: 'No Content',
      });

      await cellarService.deleteCellarItem(mockToken, mockBottleId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cellar-items/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
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
        headers: { get: jest.fn().mockReturnValue(null) },
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

describe('CellarService - cached methods', () => {
  const mockToken = 'mock-token';

  beforeEach(() => jest.clearAllMocks());

  const mockFetchOk = (data: any) =>
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: jest.fn().mockReturnValue(null) },
      json: async () => data,
    });

  it('getTotalStock should return total_stock value', async () => {
    mockFetchOk({ total_stock: 15 });
    const result = await cellarService.getTotalStock(mockToken);
    expect(result).toBe(15);
  });

  it('getStockByColour should return stock by colour data', async () => {
    const mockData = [{ colour: 'Rouge', count: 5 }];
    mockFetchOk(mockData);
    const result = await cellarService.getStockByColour(mockToken);
    expect(result).toEqual(mockData);
  });

  it('getLastAdded should return last added items', async () => {
    const mockData = [{ id: 1, bottle: { name: 'Château Test' } }];
    mockFetchOk(mockData);
    const result = await cellarService.getLastAdded(mockToken);
    expect(result).toEqual(mockData);
  });

  it('getAllCellarItems should return all items', async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    mockFetchOk(mockData);
    const result = await cellarService.getAllCellarItems(mockToken);
    expect(result).toEqual(mockData);
  });

  it('getCellarItemsByColour should return items filtered by colour', async () => {
    const mockData = [{ id: 1, bottle: { colour: { id: 1 } } }];
    mockFetchOk(mockData);
    const result = await cellarService.getCellarItemsByColour(mockToken, 1);
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cellar-items/colour/1'),
      expect.any(Object)
    );
  });

  it('getCellarItemsByColour with null colour should use null in URL', async () => {
    const mockData = [{ id: 1 }];
    mockFetchOk(mockData);
    await cellarService.getCellarItemsByColour(mockToken, null);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cellar-items/colour/null'),
      expect.any(Object)
    );
  });

  it('getCellarItem should return a single cellar item', async () => {
    const mockData = { id: 1, bottle: { name: 'Test' } };
    mockFetchOk(mockData);
    const result = await cellarService.getCellarItem(mockToken, 1);
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cellar-items/1'),
      expect.objectContaining({ method: 'GET' })
    );
  });
});

describe('CellarService - createCellarItem', () => {
  const mockToken = 'mock-token';

  beforeEach(() => jest.clearAllMocks());

  it('should create a cellar item and return data', async () => {
    const mockFormData = { bottle: { name: 'Test' }, stock: 3 };
    const mockCreated = { id: 99, ...mockFormData };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: jest.fn().mockReturnValue(null) },
      json: async () => mockCreated,
    });

    const result = await cellarService.createCellarItem(mockToken, mockFormData);
    expect(result).toEqual(mockCreated);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cellar-items'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should throw and propagate error on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: 'Validation error' }),
    });

    await expect(
      cellarService.createCellarItem(mockToken, {})
    ).rejects.toThrow();
  });
});

describe('CellarService - addComment and deleteComment', () => {
  const mockToken = 'mock-token';

  beforeEach(() => jest.clearAllMocks());

  it('addComment should POST to comments endpoint', async () => {
    const mockResponse = { id: 1, content: 'Great wine', date: '2026-02-28' };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: jest.fn().mockReturnValue(null) },
      json: async () => mockResponse,
    });

    const result = await cellarService.addComment(mockToken, 5, 'Great wine');
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cellar-items/5/comments'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('deleteComment should DELETE comment endpoint and return null for 204', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: jest.fn().mockReturnValue(null) },
      json: async () => null,
    });

    const result = await cellarService.deleteComment(mockToken, 5, 2);
    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cellar-items/5/comments/2'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('CellarService - offline scenario', () => {
  const mockToken = 'mock-token';
  const NetInfo = require('@react-native-community/netinfo');

  beforeEach(() => jest.clearAllMocks());

  it('should throw when offline and no cache available', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

    await expect(
      cellarService.getTotalStock(mockToken)
    ).rejects.toThrow('Aucune donnée en cache et pas de connexion');
  });
});

describe('CellarService - error body parse failure', () => {
  const mockToken = 'mock-token';

  beforeEach(() => jest.clearAllMocks());

  it('should throw with fallback message when error body is not JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('not json'); },
    });

    await expect(
      cellarService.getStats(mockToken)
    ).rejects.toThrow();
  });
});