import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import BottleDetailPage from '../bottle-detail';
import { cellarService } from '@/services/CellarService';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, []);
  },
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    getCellarItemById: jest.fn(),
    deleteCellarItem: jest.fn(),
  },
}));

const mockBottleData = {
  id: 1,
  stock: 6,
  price: 25.50,
  rating: 7.5,
  shop: 'Cave Dupont',
  offered_by: 'Jean',
  drinking_window_start: 2025,
  drinking_window_end: 2035,
  bottle: {
    name: 'Château Test',
    domain: { name: 'Domaine Test' },
    region: { name: 'Bordeaux' },
    colour: { name: 'Rouge' },
    grape_varieties: [
      { id: 1, name: 'Merlot' },
      { id: 2, name: 'Cabernet Sauvignon' },
    ],
  },
  vintage: { year: 2018 },
  appellation: { name: 'AOC Bordeaux' },
  comments: [
    { id: 1, content: 'Excellent vin', date: '2024-01-15' },
  ],
};

describe('BottleDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (cellarService.getCellarItemById as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<BottleDetailPage />);
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('should display bottle details when loaded', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Château Test')).toBeTruthy();
      expect(screen.getAllByText('2018').length).toBeGreaterThan(0);
      expect(screen.getByText('Bordeaux')).toBeTruthy();
      expect(screen.getByText('AOC Bordeaux')).toBeTruthy();
    });
  });

  it('should display grape varieties', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Merlot, Cabernet Sauvignon')).toBeTruthy();
    });
  });

  it('should display rating with stars when present', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Mes notes personnelles')).toBeTruthy();
      expect(screen.getByText('7.5/10')).toBeTruthy();
    });
  });

  it('should display comments when present', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Excellent vin')).toBeTruthy();
      expect(screen.getByText('15/01/2024')).toBeTruthy();
    });
  });

  it('should not display personal notes section when no rating or comments', async () => {
    const dataWithoutNotes = {
      ...mockBottleData,
      rating: undefined,
      comments: [],
    };
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(dataWithoutNotes);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.queryByText('Mes notes personnelles')).toBeNull();
    });
  });

  it('should display "Non spécifiés" when no grape varieties', async () => {
    const dataWithoutGrapes = {
      ...mockBottleData,
      bottle: {
        ...mockBottleData.bottle,
        grape_varieties: [],
      },
    };
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(dataWithoutGrapes);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Non spécifiés')).toBeTruthy();
    });
  });

  it('should handle error state', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Bouteille non trouvée')).toBeTruthy();
    });

    consoleError.mockRestore();
  });
});