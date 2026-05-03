import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import WishlistPage from '../wishlist';
import { wishlistService } from '@/services/WishlistService';

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback]);
  },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

jest.mock('@/services/WishlistService', () => ({
  wishlistService: {
    getWishlistItems: jest.fn(),
    deleteWishlistItem: jest.fn(),
  },
}));

jest.mock('../../components/OfflineIndicator', () => () => null);
jest.mock('../../components/WishlistCard', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../components/PrimaryButton', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../components/PageTitle', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('lucide-react-native', () => ({ Heart: jest.fn(() => null) }));

const mockItems = [
  {
    id: 1,
    bottle: {
      name: 'Château Test',
      domain: { name: 'Domaine Test' },
      region: { name: 'Bordeaux' },
      colour: { id: 1, name: 'Rouge' },
    },
    vintage: { year: 2020 },
    appellation: null,
  },
  {
    id: 2,
    bottle: {
      name: 'Clos du Roy',
      domain: { name: 'Domaine Roy' },
      region: { name: 'Bourgogne' },
      colour: { id: 2, name: 'Blanc' },
    },
    vintage: { year: 2019 },
    appellation: { name: 'AOP Bourgogne' },
  },
];

describe('WishlistPage', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();

    const expoRouter = require('expo-router');
    jest.spyOn(expoRouter, 'useRouter').mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    });

    const MockPageTitle = require('../../components/PageTitle').default;
    (MockPageTitle as jest.Mock).mockImplementation(({ text }: { text: string }) => {
      const R = require('react');
      const { Text } = require('react-native');
      return R.createElement(Text, null, text);
    });

    const MockPrimaryButton = require('../../components/PrimaryButton').default;
    (MockPrimaryButton as jest.Mock).mockImplementation(({ text, onPress }: any) => {
      const R = require('react');
      const { TouchableOpacity, Text } = require('react-native');
      return R.createElement(
        TouchableOpacity,
        { onPress, testID: 'primary-button' },
        R.createElement(Text, null, text)
      );
    });

    const MockWishlistCard = require('../../components/WishlistCard').default;
    (MockWishlistCard as jest.Mock).mockImplementation(
      ({ bottleName, vintage, onAddToCellar, onDelete, id }: any) => {
        const R = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        return R.createElement(
          View,
          null,
          R.createElement(Text, null, `${bottleName} ${vintage}`),
          R.createElement(
            TouchableOpacity,
            { testID: `add-to-cellar-${id}`, onPress: () => onAddToCellar(id) },
            R.createElement(Text, null, 'Ajouter à ma cave')
          ),
          R.createElement(
            TouchableOpacity,
            { testID: `delete-wishlist-${id}`, onPress: () => onDelete(id) },
            R.createElement(Text, null, 'Supprimer')
          )
        );
      }
    );
  });

  it('should display the page title', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue([]);
    render(<WishlistPage />);
    expect(screen.getByText('Ma liste de souhaits')).toBeTruthy();
  });

  it('should display the subtitle', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue([]);
    render(<WishlistPage />);
    expect(screen.getByText('Les vins qui me font rêver !')).toBeTruthy();
  });

  it('should display empty state when wishlist is empty', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue([]);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Votre liste est vide')).toBeTruthy();
    });
  });

  it('should display wishlist items after loading', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue(mockItems);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Château Test 2020')).toBeTruthy();
      expect(screen.getByText('Clos du Roy 2019')).toBeTruthy();
    });
  });

  it('should call getWishlistItems with token on mount', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue([]);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(wishlistService.getWishlistItems).toHaveBeenCalledWith('mock-token');
    });
  });

  it('should navigate to add-wishlist-item when add button is pressed', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue([]);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByTestId('primary-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('primary-button'));
    expect(mockPush).toHaveBeenCalledWith('/protected/add-wishlist-item');
  });

  it('should navigate to add-bottle with fromWishlistId when add-to-cellar is pressed', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue(mockItems);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cellar-1')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('add-to-cellar-1'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/protected/add-bottle',
        params: { fromWishlistId: 1 },
      })
    );
  });

  it('should handle fetch error gracefully', async () => {
    (wishlistService.getWishlistItems as jest.Mock).mockRejectedValue(new Error('Network error'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Votre liste est vide')).toBeTruthy();
    });

    consoleError.mockRestore();
  });
});
