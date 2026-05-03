import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddBottlePage from '../add-bottle';
import { cellarService } from '@/services/CellarService';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, []);
  },
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: jest.fn(() => ({ token: 'mock-token' })),
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

describe('AddBottlePage', () => {
  let alertSpy: jest.SpyInstance;
  let mockCapturedSubmit: ((formData: any) => Promise<void>) | null = null;
  const { useAuth } = require('@/authentication/AuthContext');
  const { useRouter } = require('expo-router');

  beforeEach(() => {
    jest.clearAllMocks();
    mockCapturedSubmit = null;
    useAuth.mockReturnValue({ token: 'mock-token' });
    useRouter.mockReturnValue({ replace: mockReplace, back: jest.fn() });
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

  it('should render the page', () => {
    const { UNSAFE_root } = render(<AddBottlePage />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should show success alert on successful submit', async () => {
    (cellarService.createCellarItem as jest.Mock).mockResolvedValue({ id: 1 });

    render(<AddBottlePage />);

    if (mockCapturedSubmit) {
      await mockCapturedSubmit({ bottle: { name: 'Test' }, stock: 3 });
    }

    await waitFor(() => {
      expect(cellarService.createCellarItem).toHaveBeenCalledWith(
        'mock-token',
        { bottle: { name: 'Test' }, stock: 3 }
      );
      expect(alertSpy).toHaveBeenCalledWith(
        'Succès',
        'Bouteille ajoutée avec succès !',
        expect.any(Array)
      );
    });
  });

  it('should navigate to dashboard when pressing OK', async () => {
    (cellarService.createCellarItem as jest.Mock).mockResolvedValue({ id: 1 });

    render(<AddBottlePage />);

    if (mockCapturedSubmit) {
      await mockCapturedSubmit({ stock: 1 });
    }

    await waitFor(() => {
      const okButton = alertSpy.mock.calls[0][2][0];
      okButton.onPress();
      expect(mockReplace).toHaveBeenCalledWith('/protected/dashboard');
    });
  });

  it('should show error alert when no token', async () => {
    useAuth.mockReturnValue({ token: null });

    render(<AddBottlePage />);

    if (mockCapturedSubmit) {
      await mockCapturedSubmit({});
    }

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Vous devez être connecté');
    });
  });

  it('should format 422 validation errors', async () => {
    const validationError = {
      response: {
        status: 422,
        data: { errors: { stock: ['Stock invalide'] } },
      },
    };
    (cellarService.createCellarItem as jest.Mock).mockRejectedValue(validationError);

    render(<AddBottlePage />);

    if (mockCapturedSubmit) {
      await mockCapturedSubmit({ stock: -1 });
    }

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erreur',
        expect.stringContaining('Stock invalide')
      );
    });
  });

  it('should show generic error for non-422 errors', async () => {
    (cellarService.createCellarItem as jest.Mock).mockRejectedValue(
      new Error('Connexion impossible')
    );

    render(<AddBottlePage />);

    if (mockCapturedSubmit) {
      await mockCapturedSubmit({});
    }

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Connexion impossible');
    });
  });
});
