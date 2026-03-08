import React from 'react';
import { render, screen } from '@testing-library/react-native';
import WishlistPage from '../wishlist';

jest.mock('../../components/PageTitle', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  Heart: jest.fn(() => null),
}));

describe('WishlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const MockPageTitle = require('../../components/PageTitle').default;
    (MockPageTitle as jest.Mock).mockImplementation(({ text }: { text: string }) => {
      const React = require('react');
      const { Text } = require('react-native');
      return React.createElement(Text, null, text);
    });
  });

  it('should render the page title', () => {
    render(<WishlistPage />);
    expect(screen.getByText('Ma liste de souhaits')).toBeTruthy();
  });

  it('should render the subtitle', () => {
    render(<WishlistPage />);
    expect(screen.getByText('Les vins qui me font rêver !')).toBeTruthy();
  });

  it('should render the coming soon message', () => {
    render(<WishlistPage />);
    expect(screen.getByText('Bientôt disponible')).toBeTruthy();
  });

  it('should render the teasing description', () => {
    render(<WishlistPage />);
    expect(
      screen.getByText(
        'Gardez une trace des vins qui vous font envie et ne ratez plus jamais une belle bouteille.'
      )
    ).toBeTruthy();
  });
});
