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
});
