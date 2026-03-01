import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import CellarPage from '../cellar';
import { cellarService } from '@/services/CellarService';

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback]);
  },
  router: { push: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    getAllCellarItems: jest.fn(),
    getCellarItemsByColour: jest.fn(),
  },
}));

jest.mock('../../components/OfflineIndicator', () => () => null);

jest.mock('../../components/BottleCard', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockItems = [
  {
    id: 1,
    stock: 6,
    price: 25.50,
    rating: 8,
    bottle: {
      name: 'Château Test',
      domain: { name: 'Domaine Test' },
      region: { name: 'Bordeaux' },
      colour: { id: 1, name: 'Rouge' },
    },
    vintage: { year: 2018 },
    appellation: null,
  },
  {
    id: 2,
    stock: 3,
    price: undefined,
    rating: undefined,
    bottle: {
      name: 'Blanc de Blancs',
      domain: { name: 'Domaine Blanc' },
      region: null,
      colour: { id: 2, name: 'Blanc' },
    },
    vintage: { year: 2020 },
    appellation: null,
  },
];

describe('CellarPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const MockBottleCard = require('../../components/BottleCard').default;
    (MockBottleCard as jest.Mock).mockImplementation(({ bottleName }: any) => {
      const React = require('react');
      const { Text } = require('react-native');
      return React.createElement(Text, null, bottleName);
    });
  });

  it('should render the page title', async () => {
    (cellarService.getAllCellarItems as jest.Mock).mockResolvedValue([]);
    render(<CellarPage />);
    expect(screen.getByText('Ma cave en détail')).toBeTruthy();
  });

  it('should render colour filter buttons', async () => {
    (cellarService.getAllCellarItems as jest.Mock).mockResolvedValue([]);
    render(<CellarPage />);
    expect(screen.getByText('Toutes')).toBeTruthy();
    expect(screen.getByText('Rouge')).toBeTruthy();
    expect(screen.getByText('Blanc')).toBeTruthy();
    expect(screen.getByText('Rosé')).toBeTruthy();
  });

  it('should display cellar items after loading', async () => {
    (cellarService.getAllCellarItems as jest.Mock).mockResolvedValue(mockItems);
    render(<CellarPage />);

    await waitFor(() => {
      expect(screen.getByText('Château Test')).toBeTruthy();
      expect(screen.getByText('Blanc de Blancs')).toBeTruthy();
    });
  });

  it('should display "Aucune bouteille trouvée" when list is empty', async () => {
    (cellarService.getAllCellarItems as jest.Mock).mockResolvedValue([]);
    render(<CellarPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucune bouteille trouvée')).toBeTruthy();
    });
  });

  it('should show loading text while fetching', () => {
    (cellarService.getAllCellarItems as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    render(<CellarPage />);
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('should filter by colour when a filter button is pressed', async () => {
    (cellarService.getAllCellarItems as jest.Mock).mockResolvedValue(mockItems);
    const filteredItems = [mockItems[0]];
    (cellarService.getCellarItemsByColour as jest.Mock).mockResolvedValue(filteredItems);

    render(<CellarPage />);
    await waitFor(() => expect(screen.getByText('Château Test')).toBeTruthy());

    fireEvent.press(screen.getByText('Rouge'));

    await waitFor(() => {
      expect(cellarService.getCellarItemsByColour).toHaveBeenCalledWith('mock-token', 1);
    });
  });

  it('should handle fetch error gracefully', async () => {
    (cellarService.getAllCellarItems as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );
    render(<CellarPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucune bouteille trouvée')).toBeTruthy();
    });
  });
});
