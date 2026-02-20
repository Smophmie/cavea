import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddBottlePage from '../add-bottle';
import { cellarService } from '@/services/CellarService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mutable token so individual tests can simulate an unauthenticated state
let mockToken: string | null = 'mock-token';

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: mockToken }),
}));

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    createCellarItem: jest.fn(),
  },
}));

jest.mock('../../components/AddOrUpdateBottleForm', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => (
    <>
      <TouchableOpacity testID="submit-button" onPress={() => onSubmit({ bottle: { name: 'Test' } })}>
        <Text>Soumettre</Text>
      </TouchableOpacity>
    </>
  );
});

describe('AddBottlePage', () => {
  const mockedCreate = cellarService.createCellarItem as jest.MockedFunction<
    typeof cellarService.createCellarItem
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'mock-token';
  });

  it('renders the form', () => {
    render(<AddBottlePage />);

    expect(screen.getByTestId('submit-button')).toBeTruthy();
  });

  it('shows an error alert when no token is available', async () => {
    mockToken = null;
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<AddBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Vous devez être connecté');
    });

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('calls createCellarItem with the token and form data on submit', async () => {
    mockedCreate.mockResolvedValueOnce({ id: 1 } as any);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<AddBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledWith('mock-token', { bottle: { name: 'Test' } });
    });
  });

  it('shows a success alert and redirects to dashboard on OK press', async () => {
    mockedCreate.mockResolvedValueOnce({ id: 1 } as any);
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<AddBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Succès',
        'Bouteille ajoutée avec succès !',
        expect.arrayContaining([expect.objectContaining({ text: 'OK' })])
      );
    });

    // Simulate pressing OK in the success dialog
    const [, , buttons] = alertSpy.mock.calls[0] as any;
    buttons[0].onPress();

    expect(mockReplace).toHaveBeenCalledWith('/protected/dashboard');
  });

  it('shows a generic error alert on network failure', async () => {
    mockedCreate.mockRejectedValueOnce(new Error('Network error'));
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<AddBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Network error');
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows flattened validation messages on 422 error', async () => {
    const validationError = new Error('Validation failed') as any;
    validationError.response = {
      status: 422,
      data: {
        errors: {
          'bottle.name': ['Le nom est requis'],
          stock: ['Le stock doit être positif'],
        },
      },
    };
    mockedCreate.mockRejectedValueOnce(validationError);
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<AddBottlePage />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erreur',
        'Le nom est requis\nLe stock doit être positif'
      );
    });
  });
});