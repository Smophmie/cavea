import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddFromWishlistPage from '../add-from-wishlist';
import { wishlistService } from '@/services/WishlistService';
import { cellarService } from '@/services/CellarService';

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({ id: '5' })),
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: jest.fn(() => ({ token: 'mock-token' })),
}));

jest.mock('@/services/WishlistService', () => ({
  wishlistService: {
    getWishlistItemById: jest.fn(),
    deleteWishlistItem: jest.fn(),
  },
}));

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    createCellarItem: jest.fn(),
  },
}));

jest.mock('@/app/components/AddOrUpdateBottleForm', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockWishlistItem = {
  bottle: {
    name: 'Château Test',
    domain: { name: 'Domaine Test' },
    colour: { id: 1, name: 'Rouge' },
    region: { id: 3, name: 'Bordeaux' },
    grapeVarieties: [],
  },
  vintage: { year: 2020 },
  appellation: { name: 'AOP Bordeaux' },
};

describe('AddFromWishlistPage', () => {
  let alertSpy: jest.SpyInstance;
  let mockCapturedSubmit: ((formData: any) => Promise<void>) | null = null;
  const { useRouter } = require('expo-router');
  const { useAuth } = require('@/authentication/AuthContext');

  beforeEach(() => {
    jest.clearAllMocks();
    mockCapturedSubmit = null;
    useRouter.mockReturnValue({ replace: mockReplace, back: mockBack });
    useAuth.mockReturnValue({ token: 'mock-token' });
    alertSpy = jest.spyOn(Alert, 'alert');

    const MockForm = require('@/app/components/AddOrUpdateBottleForm').default;
    (MockForm as jest.Mock).mockImplementation((props: any) => {
      mockCapturedSubmit = props.onSubmit;
      return null;
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('should show loading indicator while fetching wishlist item', () => {
    (wishlistService.getWishlistItemById as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    const { getByRole } = render(<AddFromWishlistPage />);
    expect(getByRole('progressbar')).toBeTruthy();
  });

  it('should hide loading indicator and render form after fetch', async () => {
    (wishlistService.getWishlistItemById as jest.Mock).mockResolvedValue(mockWishlistItem);

    const MockForm = require('@/app/components/AddOrUpdateBottleForm').default;
    render(<AddFromWishlistPage />);

    await waitFor(() => expect(MockForm).toHaveBeenCalled());

    const receivedProps = (MockForm as jest.Mock).mock.calls.at(-1)[0];
    expect(receivedProps.mode).toBe('add');
    expect(receivedProps.initialData).toMatchObject({
      bottle: {
        name: 'Château Test',
        domain_name: 'Domaine Test',
        colour_id: 1,
        region_id: 3,
      },
      vintage: { year: '2020' },
      appellation_name: 'AOP Bordeaux',
    });
  });

  it('should pre-fill without vintage when wishlist item has no vintage', async () => {
    (wishlistService.getWishlistItemById as jest.Mock).mockResolvedValue({
      ...mockWishlistItem,
      vintage: null,
    });

    const MockForm = require('@/app/components/AddOrUpdateBottleForm').default;
    render(<AddFromWishlistPage />);

    await waitFor(() => expect(MockForm).toHaveBeenCalled());

    const receivedProps = (MockForm as jest.Mock).mock.calls.at(-1)[0];
    expect(receivedProps.initialData).not.toHaveProperty('vintage');
  });

  it('should show error alert and navigate back on fetch failure', async () => {
    (wishlistService.getWishlistItemById as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<AddFromWishlistPage />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de charger les données du vin',
        expect.any(Array)
      );
    });
  });

  it('should add to cellar and delete wishlist item on successful submit', async () => {
    (wishlistService.getWishlistItemById as jest.Mock).mockResolvedValue(mockWishlistItem);
    (cellarService.createCellarItem as jest.Mock).mockResolvedValue({ id: 10 });
    (wishlistService.deleteWishlistItem as jest.Mock).mockResolvedValue(undefined);

    render(<AddFromWishlistPage />);

    await waitFor(() => expect(mockCapturedSubmit).not.toBeNull());

    await mockCapturedSubmit!({ bottle: { name: 'Château Test' }, stock: 2 });

    await waitFor(() => {
      expect(cellarService.createCellarItem).toHaveBeenCalledWith(
        'mock-token',
        { bottle: { name: 'Château Test' }, stock: 2 }
      );
      expect(wishlistService.deleteWishlistItem).toHaveBeenCalledWith('mock-token', 5);
      expect(alertSpy).toHaveBeenCalledWith(
        'Succès',
        'Bouteille ajoutée à votre cave !',
        expect.any(Array)
      );
    });
  });

  it('should navigate to dashboard after pressing OK on success', async () => {
    (wishlistService.getWishlistItemById as jest.Mock).mockResolvedValue(mockWishlistItem);
    (cellarService.createCellarItem as jest.Mock).mockResolvedValue({ id: 10 });
    (wishlistService.deleteWishlistItem as jest.Mock).mockResolvedValue(undefined);

    render(<AddFromWishlistPage />);

    await waitFor(() => expect(mockCapturedSubmit).not.toBeNull());
    await mockCapturedSubmit!({ stock: 1 });

    await waitFor(() => {
      const okButton = alertSpy.mock.calls[0][2][0];
      okButton.onPress();
      expect(mockReplace).toHaveBeenCalledWith('/protected/dashboard');
    });
  });

  it('should show error alert when no token', async () => {
    useAuth.mockReturnValue({ token: null });

    render(<AddFromWishlistPage />);

    await waitFor(() => expect(mockCapturedSubmit).not.toBeNull());
    await mockCapturedSubmit!({});

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Vous devez être connecté');
    });
  });

  it('should show formatted validation errors on 422', async () => {
    (wishlistService.getWishlistItemById as jest.Mock).mockResolvedValue(mockWishlistItem);
    (cellarService.createCellarItem as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { errors: { stock: ['Le stock est requis'] } } },
    });

    render(<AddFromWishlistPage />);

    await waitFor(() => expect(mockCapturedSubmit).not.toBeNull());
    await mockCapturedSubmit!({});

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erreur',
        expect.stringContaining('Le stock est requis')
      );
    });
  });
});
