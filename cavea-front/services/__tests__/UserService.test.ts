import { userService } from '../UserService';
import { baseURL } from '@/api';

global.fetch = jest.fn();

const mockToken = 'mock-token-123';

describe('UserService - getMe', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return user profile on success', async () => {
    const mockProfile = { id: 1, name: 'Dupont', firstname: 'Jean', email: 'jean@test.com' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProfile,
    });

    const result = await userService.getMe(mockToken);

    expect(result).toEqual(mockProfile);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/user/me`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
      })
    );
  });

  it('should throw with service error message on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthenticated.' }),
    });

    await expect(userService.getMe(mockToken)).rejects.toThrow(
      'Impossible de récupérer les informations.'
    );
  });

  it('should throw with default message when no message in response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(userService.getMe(mockToken)).rejects.toThrow(
      'Impossible de récupérer les informations.'
    );
  });

  it('should throw on network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

    await expect(userService.getMe(mockToken)).rejects.toThrow('Network request failed');
  });
});

describe('UserService - getStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return stats with all values filled', async () => {
    const mockStats = { total_stock: 42, total_value: 1250.5, favourite_region: 'Bordeaux' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockStats,
    });

    const result = await userService.getStats(mockToken);

    expect(result).toEqual(mockStats);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/user/stats`,
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

    const result = await userService.getStats(mockToken);

    expect(result.total_value).toBeNull();
  });

  it('should return stats with null favourite_region when cellar is empty', async () => {
    const mockStats = { total_stock: 0, total_value: null, favourite_region: null };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockStats,
    });

    const result = await userService.getStats(mockToken);

    expect(result.total_stock).toBe(0);
    expect(result.favourite_region).toBeNull();
  });

  it('should throw on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(userService.getStats(mockToken)).rejects.toThrow(
      'Impossible de récupérer les statistiques.'
    );
  });
});

describe('UserService - deleteAccount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should resolve on 204 success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await expect(userService.deleteAccount(mockToken)).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/user`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
      })
    );
  });

  it('should throw with service error message on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error.' }),
    });

    await expect(userService.deleteAccount(mockToken)).rejects.toThrow(
      'Impossible de supprimer le compte.'
    );
  });

  it('should throw on network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

    await expect(userService.deleteAccount(mockToken)).rejects.toThrow('Network request failed');
  });
});
