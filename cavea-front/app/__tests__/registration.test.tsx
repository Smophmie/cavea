import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import RegistrationPage from '../registration';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../api', () => ({
  baseURL: 'http://localhost',
}));

jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return { Image };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe('RegistrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the logo', () => {
    render(<RegistrationPage />);
    const images = screen.UNSAFE_getAllByType(require('react-native').Image);
    expect(images.length).toBeGreaterThan(0);
  });

  it('should display the back button', () => {
    render(<RegistrationPage />);
    const touchables = screen.UNSAFE_getAllByType(
      require('react-native').TouchableOpacity
    );
    expect(touchables.length).toBeGreaterThan(0);
  });

  it('should display the registration form title', () => {
    render(<RegistrationPage />);
    expect(screen.getByText('Créer un compte')).toBeTruthy();
  });

  it('should navigate to login when link is pressed', () => {
    render(<RegistrationPage />);
    fireEvent.press(screen.getByText('Connexion'));
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should show error when passwords do not match', async () => {
    render(<RegistrationPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'password1');
    fireEvent.changeText(screen.getByPlaceholderText('Confirmez le mot de passe'), 'password2');
    fireEvent.press(screen.getByText('Créer mon compte'));

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeTruthy();
    });
  });

  it('should show success message and redirect on successful registration', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { firstname: 'Sophie' } }),
    }) as any;

    jest.useFakeTimers();

    render(<RegistrationPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Prénom'), 'Sophie');
    fireEvent.changeText(screen.getByPlaceholderText('Nom'), 'Dupont');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'sophie@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'secret123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirmez le mot de passe'), 'secret123');
    fireEvent.press(screen.getByText('Créer mon compte'));

    await waitFor(() => {
      expect(screen.getByText(/Compte créé avec succès/)).toBeTruthy();
    });

    jest.runAllTimers();
    expect(mockPush).toHaveBeenCalledWith('/login');
    jest.useRealTimers();
  });

  it('should show API validation errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        errors: { email: ['Email déjà utilisé'] },
      }),
    }) as any;

    render(<RegistrationPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'pass');
    fireEvent.changeText(screen.getByPlaceholderText('Confirmez le mot de passe'), 'pass');
    fireEvent.press(screen.getByText('Créer mon compte'));

    await waitFor(() => {
      expect(screen.getByText('Email déjà utilisé')).toBeTruthy();
    });
  });

  it('should show generic error message on API failure without errors field', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Erreur serveur' }),
    }) as any;

    render(<RegistrationPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'pass');
    fireEvent.changeText(screen.getByPlaceholderText('Confirmez le mot de passe'), 'pass');
    fireEvent.press(screen.getByText('Créer mon compte'));

    await waitFor(() => {
      expect(screen.getByText('Erreur serveur')).toBeTruthy();
    });
  });

  it('should show server unreachable message on network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;

    render(<RegistrationPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'pass');
    fireEvent.changeText(screen.getByPlaceholderText('Confirmez le mot de passe'), 'pass');
    fireEvent.press(screen.getByText('Créer mon compte'));

    await waitFor(() => {
      expect(screen.getByText('Impossible de contacter le serveur.')).toBeTruthy();
    });
  });
});