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