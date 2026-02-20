import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UpdateBottlePage from '../update-bottle';
import { cellarService } from '@/services/CellarService';


const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ id: '42' }),
}));

let mockToken: string | null = 'mock-token';

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: mockToken }),
}));

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    updateCellarItem: jest.fn(),
  },
}));

jest.mock('../../components/AddOrUpdateBottleForm', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <TouchableOpacity testID="submit-button" onPress={() => onSubmit({ stock: 5 })}>
      <Text>Soumettre</Text>
    </TouchableOpacity>
  );
});


describe('UpdateBottlePage', () => {
  const mockedUpdate = cellarService.updateCellarItem as jest.MockedFunction<
    typeof cellarService.updateCellarItem
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'mock-token';
  });

  it('renders the form in update mode', () => {
    render(<UpdateBottlePage />);

    expect(screen.getByTestId('submit-button')).toBeTruthy();
  });

  it('shows an error alert when no token is available', async () => {
    mockToken = null;
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<UpdateBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Informations manquantes');
    });

    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it('calls updateCellarItem with the correct token, id and form data', async () => {
    mockedUpdate.mockResolvedValueOnce({} as any);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<UpdateBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith('mock-token', 42, { stock: 5 });
    });
  });

  it('shows a success alert after a successful update', async () => {
    mockedUpdate.mockResolvedValueOnce({} as any);
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<UpdateBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Succès',
        'Bouteille modifiée avec succès !',
        expect.arrayContaining([expect.objectContaining({ text: 'OK' })])
      );
    });
  });

  it('navigates back when pressing OK on the success alert', async () => {
    mockedUpdate.mockResolvedValueOnce({} as any);
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<UpdateBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    const [, , buttons] = alertSpy.mock.calls[0] as any;
    buttons[0].onPress();

    expect(mockBack).toHaveBeenCalled();
  });

  it('shows a generic error alert on network failure', async () => {
    mockedUpdate.mockRejectedValueOnce(new Error('Network timeout'));
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<UpdateBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Network timeout');
    });

    expect(mockBack).not.toHaveBeenCalled();
  });

  it('shows flattened validation messages on 422 error', async () => {
    const validationError = new Error('Validation failed') as any;
    validationError.response = {
      status: 422,
      data: {
        errors: {
          rating: ['La note doit être entre 0 et 10'],
          stock: ['Le stock est requis'],
        },
      },
    };
    mockedUpdate.mockRejectedValueOnce(validationError);
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<UpdateBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erreur',
        'La note doit être entre 0 et 10\nLe stock est requis'
      );
    });
  });
});