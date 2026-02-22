import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
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
});