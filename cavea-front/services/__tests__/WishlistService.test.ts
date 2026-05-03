import { wishlistService } from '../WishlistService';
import { baseURL } from '@/api';

global.fetch = jest.fn();

const mockToken = 'mock-token-123';

const mockOk = (data: any, status = 200) =>
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => data,
  });

const mockError = (status: number, message = 'Error') =>
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ message }),
  });

beforeEach(() => jest.clearAllMocks());

describe('WishlistService - getWishlistItems', () => {
  it('should return the list of wishlist items', async () => {
    const mockData = [{ id: 1, bottle: { name: 'Test' } }];
    mockOk(mockData);

    const result = await wishlistService.getWishlistItems(mockToken);

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/wishlist-items`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
      })
    );
  });

  it('should throw on API error', async () => {
    mockError(401);
    await expect(wishlistService.getWishlistItems(mockToken)).rejects.toThrow();
  });
});

describe('WishlistService - getWishlistItemById', () => {
  it('should return a single wishlist item by id', async () => {
    const mockData = { id: 5, bottle: { name: 'Wine' } };
    mockOk(mockData);

    const result = await wishlistService.getWishlistItemById(mockToken, 5);

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/wishlist-items/5`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should throw 404 when not found', async () => {
    mockError(404, 'Not found');
    await expect(wishlistService.getWishlistItemById(mockToken, 999)).rejects.toThrow();
  });
});

describe('WishlistService - createWishlistItem', () => {
  const payload = {
    bottle: {
      name: 'Château Test',
      domain_name: 'Domaine Test',
      colour_id: 1,
      region_id: 2,
    },
    vintage: { year: 2020 },
  };

  it('should POST and return the created wishlist item', async () => {
    const created = { id: 10, ...payload };
    mockOk(created, 201);

    const result = await wishlistService.createWishlistItem(mockToken, payload);

    expect(result).toEqual(created);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/wishlist-items`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should throw validation error on 422', async () => {
    mockError(422, 'Les données fournies ne sont pas valides');
    await expect(wishlistService.createWishlistItem(mockToken, payload)).rejects.toThrow(
      'Les données fournies ne sont pas valides'
    );
  });

  it('should include appellation_name when provided', async () => {
    const payloadWithApp = { ...payload, appellation_name: 'AOP Languedoc' };
    mockOk({ id: 11, ...payloadWithApp }, 201);

    await wishlistService.createWishlistItem(mockToken, payloadWithApp);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify(payloadWithApp) })
    );
  });
});

describe('WishlistService - deleteWishlistItem', () => {
  it('should DELETE the wishlist item and return null', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 });

    const result = await wishlistService.deleteWishlistItem(mockToken, 7);

    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseURL}/wishlist-items/7`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
      })
    );
  });

  it('should throw 403 when not authorized', async () => {
    mockError(403, 'Forbidden');
    await expect(wishlistService.deleteWishlistItem(mockToken, 7)).rejects.toThrow();
  });
});
