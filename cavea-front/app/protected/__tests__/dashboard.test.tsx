import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import DashboardPage from '../dashboard';
import { cellarService } from '@/services/CellarService';

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback]);
  },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    getTotalStock: jest.fn(),
    getStockByColour: jest.fn(),
    getLastAdded: jest.fn(),
  },
}));

jest.mock('../../components/OfflineIndicator', () => () => null);
jest.mock('../../components/StockByColour', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
jest.mock('../../components/BottleCard', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockLastAdded = [
  {
    id: 1,
    stock: 3,
    price: 20,
    bottle: {
      name: 'Château Test',
      domain: { name: 'Domaine Test' },
      region: { name: 'Bordeaux' },
      colour: { name: 'Rouge' },
    },
    vintage: { year: 2020 },
    appellation: null,
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const MockBottleCard = require('../../components/BottleCard').default;
    (MockBottleCard as jest.Mock).mockImplementation(({ bottleName }: any) => {
      const React = require('react');
      const { Text } = require('react-native');
      return React.createElement(Text, null, bottleName);
    });
  });

  it('should show loading state initially', () => {
    (cellarService.getTotalStock as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (cellarService.getStockByColour as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (cellarService.getLastAdded as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<DashboardPage />);
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('should display total stock after loading', async () => {
    (cellarService.getTotalStock as jest.Mock).mockResolvedValue(42);
    (cellarService.getStockByColour as jest.Mock).mockResolvedValue([]);
    (cellarService.getLastAdded as jest.Mock).mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeTruthy();
    });
  });

  it('should display last added bottles', async () => {
    (cellarService.getTotalStock as jest.Mock).mockResolvedValue(5);
    (cellarService.getStockByColour as jest.Mock).mockResolvedValue([]);
    (cellarService.getLastAdded as jest.Mock).mockResolvedValue(mockLastAdded);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Château Test')).toBeTruthy();
    });
  });

  it('should display "Aucun ajout récent" when no last added items', async () => {
    (cellarService.getTotalStock as jest.Mock).mockResolvedValue(0);
    (cellarService.getStockByColour as jest.Mock).mockResolvedValue([]);
    (cellarService.getLastAdded as jest.Mock).mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun ajout récent')).toBeTruthy();
    });
  });

  it('should handle fetch error gracefully', async () => {
    (cellarService.getTotalStock as jest.Mock).mockRejectedValue(new Error('Network error'));
    (cellarService.getStockByColour as jest.Mock).mockRejectedValue(new Error('Network error'));
    (cellarService.getLastAdded as jest.Mock).mockRejectedValue(new Error('Network error'));

    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun ajout récent')).toBeTruthy();
    });

    consoleError.mockRestore();
  });

  it('should call all cellar service methods on mount', async () => {
    (cellarService.getTotalStock as jest.Mock).mockResolvedValue(0);
    (cellarService.getStockByColour as jest.Mock).mockResolvedValue([]);
    (cellarService.getLastAdded as jest.Mock).mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(cellarService.getTotalStock).toHaveBeenCalledWith('mock-token');
      expect(cellarService.getStockByColour).toHaveBeenCalledWith('mock-token');
      expect(cellarService.getLastAdded).toHaveBeenCalledWith('mock-token');
    });
  });
});
