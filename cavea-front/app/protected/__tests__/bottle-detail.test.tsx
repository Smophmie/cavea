import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import BottleDetailPage from '../bottle-detail';
import { cellarService } from '@/services/CellarService';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
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
    updateCellarItem: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => <View testID="slider" />;
});

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
      expect(screen.getByText('7.5/20')).toBeTruthy();
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

  it('should always display personal notes section and show "Non notée" when no rating', async () => {
    const dataWithoutNotes = {
      ...mockBottleData,
      rating: undefined,
      comments: [],
    };
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(dataWithoutNotes);

    render(<BottleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Mes notes personnelles')).toBeTruthy();
      expect(screen.getByText('Non notée')).toBeTruthy();
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

  it('should add a comment when pressing the add button', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);
    (cellarService.addComment as jest.Mock).mockResolvedValue({ id: 2, content: 'Super', date: '2026-01-01' });

    render(<BottleDetailPage />);

    await waitFor(() => expect(screen.getByText('Château Test')).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText('Ajouter un commentaire...'), 'Super');
    fireEvent.press(screen.getByText('Ajouter'));

    await waitFor(() => {
      expect(cellarService.addComment).toHaveBeenCalledWith('mock-token', 1, 'Super');
    });
  });

  it('should delete a comment when pressing the trash icon', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);
    (cellarService.deleteComment as jest.Mock).mockResolvedValue(null);

    render(<BottleDetailPage />);

    await waitFor(() => expect(screen.getByText('Excellent vin')).toBeTruthy());

    const trashButtons = screen.UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    const deleteButton = trashButtons.find(
      (btn: any) => btn.props.onPress?.toString().includes('handleDeleteComment') ||
        btn.props.testID === 'delete-comment'
    );

    fireEvent.press(trashButtons[trashButtons.length - 2]);

    await waitFor(() => {
      expect(cellarService.deleteComment).toHaveBeenCalledWith('mock-token', 1, 1);
    });
  });

  it('should show and hide rating edit slider', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => expect(screen.getByText('7.5/20')).toBeTruthy());

    // index 0 = BackButton, index 1 = rating edit pencil
    const touchables = screen.UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    fireEvent.press(touchables[1]);

    await waitFor(() => {
      expect(screen.getByTestId('slider')).toBeTruthy();
    });
  });

  it('should save rating when pressing save button', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);
    (cellarService.updateCellarItem as jest.Mock).mockResolvedValue({ ...mockBottleData, rating: 9 });

    render(<BottleDetailPage />);

    await waitFor(() => expect(screen.getByText('7.5/20')).toBeTruthy());

    // Open rating editor
    const touchables = screen.UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    fireEvent.press(touchables[1]);

    await waitFor(() => {
      expect(screen.getByText('Enregistrer la note')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Enregistrer la note'));

    await waitFor(() => {
      expect(cellarService.updateCellarItem).toHaveBeenCalledWith(
        'mock-token', 1, { rating: expect.any(Number) }
      );
    });
  });

  it('should show delete modal when trash icon is pressed', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => expect(screen.getByText('Château Test')).toBeTruthy());

    fireEvent.press(screen.getByTestId('delete-bottle-btn'));

    await waitFor(() => {
      expect(screen.getByText('Supprimer la bouteille')).toBeTruthy();
    });
  });

  it('should cancel delete when pressing Annuler in modal', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);

    render(<BottleDetailPage />);

    await waitFor(() => expect(screen.getByText('Château Test')).toBeTruthy());

    fireEvent.press(screen.getByTestId('delete-bottle-btn'));

    await waitFor(() => expect(screen.getByText('Supprimer la bouteille')).toBeTruthy());

    fireEvent.press(screen.getByText('Annuler'));

    await waitFor(() => {
      expect(screen.queryByText('Supprimer la bouteille')).toBeNull();
    });
  });

  it('should confirm delete and call deleteCellarItem', async () => {
    (cellarService.getCellarItemById as jest.Mock).mockResolvedValue(mockBottleData);
    (cellarService.deleteCellarItem as jest.Mock).mockResolvedValue(null);

    render(<BottleDetailPage />);

    await waitFor(() => expect(screen.getByText('Château Test')).toBeTruthy());

    fireEvent.press(screen.getByTestId('delete-bottle-btn'));

    await waitFor(() => expect(screen.getByText('Supprimer la bouteille')).toBeTruthy());

    fireEvent.press(screen.getByText('Supprimer'));

    await waitFor(() => {
      expect(cellarService.deleteCellarItem).toHaveBeenCalledWith('mock-token', 1);
    });
  });
});