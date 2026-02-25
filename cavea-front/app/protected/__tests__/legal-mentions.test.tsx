import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import LegalMentionsPage from '../legal-mentions';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return new Proxy({}, {
    get: (_: any, name: string) => {
      const Icon = () => <View testID={`icon-${name}`} />;
      return Icon;
    },
  });
});

describe('LegalMentionsPage - contenu', () => {
  it('should display page title', () => {
    render(<LegalMentionsPage />);
    expect(screen.getByText('Mentions légales')).toBeTruthy();
  });

  it('should display editor information', () => {
    render(<LegalMentionsPage />);
    expect(screen.getByText('Sophie Théréau')).toBeTruthy();
    expect(screen.getByText('Développeuse indépendante')).toBeTruthy();
    expect(screen.getByText('sothereau@gmail.com')).toBeTruthy();
    expect(screen.getByText('Cavea')).toBeTruthy();
  });

  it('should display all section titles', () => {
    render(<LegalMentionsPage />);
    expect(screen.getByText("Éditeur de l'application")).toBeTruthy();
    expect(screen.getByText('Propriété intellectuelle')).toBeTruthy();
    expect(screen.getByText('Données personnelles')).toBeTruthy();
    expect(screen.getByText('Limitation de responsabilité')).toBeTruthy();
    expect(screen.getByText('Droit applicable')).toBeTruthy();
  });

  it('should display GDPR rights information', () => {
    render(<LegalMentionsPage />);
    expect(screen.getByText(/RGPD/)).toBeTruthy();
  });

  it('should display privacy policy button', () => {
    render(<LegalMentionsPage />);
    expect(screen.getByText('Politique de confidentialité')).toBeTruthy();
  });
});

describe('LegalMentionsPage - navigation', () => {
  it('should go back when pressing back button', () => {
    render(<LegalMentionsPage />);
    const buttons = screen.UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    fireEvent.press(buttons[0]);
    expect(mockBack).toHaveBeenCalled();
  });
});

describe('LegalMentionsPage - liens', () => {
  let linkingSpy: jest.SpyInstance;

  beforeEach(() => {
    linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue();
  });

  afterEach(() => linkingSpy.mockRestore());

  it('should open privacy policy URL when pressing button', () => {
    render(<LegalMentionsPage />);
    fireEvent.press(screen.getByText('Politique de confidentialité'));

    expect(linkingSpy).toHaveBeenCalledWith('https://smophmie.github.io/cavea-privacy/');
  });
});
