import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LoginPage from '../login';

const mockLogin = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

jest.mock('@/api', () => ({
  baseURL: 'http://localhost',
}));

jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return { Image };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the login form', () => {
    render(<LoginPage />);
    expect(screen.getAllByText('Connexion').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeTruthy();
  });

  it('should render navigation link to registration', () => {
    render(<LoginPage />);
    expect(screen.getByText('Créer mon compte')).toBeTruthy();
  });

  it('should update email and password fields', () => {
    render(<LoginPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'password123');
    expect(screen.getByDisplayValue('test@test.com')).toBeTruthy();
    expect(screen.getByDisplayValue('password123')).toBeTruthy();
  });

  it('should call login and redirect to dashboard on success', async () => {
    mockLogin.mockResolvedValueOnce(null);

    render(<LoginPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'secret');
    fireEvent.press(screen.getAllByText('Connexion')[1]);

    const { router } = require('expo-router');
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'secret');
      expect(router.replace).toHaveBeenCalledWith('/protected/dashboard');
    });
  });

  it('should display error message when login fails', async () => {
    mockLogin.mockResolvedValueOnce('Identifiants incorrects');

    render(<LoginPage />);
    fireEvent.press(screen.getAllByText('Connexion')[1]);

    await waitFor(() => {
      expect(screen.getByText('Identifiants incorrects')).toBeTruthy();
    });
  });

  it('should show loading indicator while logging in', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />);
    fireEvent.press(screen.getAllByText('Connexion')[1]);

    await waitFor(() => {
      // Button disappears when loading, only the PageTitle "Connexion" remains
      expect(screen.getAllByText('Connexion').length).toBe(1);
    });
  });

  it('should show email not verified message when login returns EMAIL_NOT_VERIFIED', async () => {
    mockLogin.mockResolvedValueOnce('EMAIL_NOT_VERIFIED');

    render(<LoginPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.press(screen.getAllByText('Connexion')[1]);

    await waitFor(() => {
      expect(screen.getByText("Votre email n'a pas encore été vérifié.")).toBeTruthy();
      expect(screen.getByText("Renvoyer l'email de vérification")).toBeTruthy();
    });
  });

  it('should not redirect to dashboard when email is not verified', async () => {
    mockLogin.mockResolvedValueOnce('EMAIL_NOT_VERIFIED');

    render(<LoginPage />);
    fireEvent.press(screen.getAllByText('Connexion')[1]);

    const { router } = require('expo-router');
    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  it('should call resend API and show success message', async () => {
    mockLogin.mockResolvedValueOnce('EMAIL_NOT_VERIFIED');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Email de vérification renvoyé.' }),
    }) as any;

    render(<LoginPage />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.press(screen.getAllByText('Connexion')[1]);

    await waitFor(() => {
      expect(screen.getByText("Renvoyer l'email de vérification")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Renvoyer l'email de vérification"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/email/resend',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@test.com' }),
        })
      );
      expect(screen.getByText('Email de vérification renvoyé.')).toBeTruthy();
    });
  });

  it('should show error message when resend fails', async () => {
    mockLogin.mockResolvedValueOnce('EMAIL_NOT_VERIFIED');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Aucun compte trouvé avec cet email.' }),
    }) as any;

    render(<LoginPage />);
    fireEvent.press(screen.getAllByText('Connexion')[1]);

    await waitFor(() => {
      expect(screen.getByText("Renvoyer l'email de vérification")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Renvoyer l'email de vérification"));

    await waitFor(() => {
      expect(screen.getByText('Aucun compte trouvé avec cet email.')).toBeTruthy();
    });
  });
});
