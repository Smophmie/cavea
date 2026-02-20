import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react-native';
import BottleDetailPage from '../bottle-detail';
import { cellarService } from '@/services/CellarService';

let focusCallback: (() => void) | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    focusCallback = cb;
    React.useEffect(cb, []);
  },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

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
    focusCallback = null;
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
      bottle: { ...mockBottleData.bottle, grape_varieties: [] },
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

  it('should call getCellarItemById again when the screen regains focus', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Château Test')).toBeTruthy();
    });

    expect(cellarService.getCellarItemById).toHaveBeenCalledTimes(1);

    // Simulate returning from the edit screen
    await act(async () => {
      focusCallback?.();
    });

    expect(cellarService.getCellarItemById).toHaveBeenCalledTimes(2);
  });

  it('should display updated data after returning from the edit screen', async () => {
    const updatedBottle = {
      ...mockBottleData,
      stock: 99,
      bottle: { ...mockBottleData.bottle, name: 'Château Modifié' },
    };

    (cellarService.getCellarItemById as jest.Mock)
      .mockResolvedValueOnce(mockBottleData)
      .mockResolvedValueOnce(updatedBottle);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Château Test')).toBeTruthy();
    });

    await act(async () => {
      focusCallback?.();
    });

    await waitFor(() => {
      expect(screen.getByText('Château Modifié')).toBeTruthy();
      expect(screen.getByText('x99')).toBeTruthy();
    });

    expect(screen.queryByText('Château Test')).toBeNull();
  });
});