import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import WishlistCard from '../WishlistCard';

jest.mock('lucide-react-native', () => ({
  BottleWine: () => null,
  Trash2: () => null,
  ShoppingBag: () => null,
}));

const defaultProps = {
  id: 1,
  bottleName: 'Château Margaux',
  domainName: 'Château Margaux SCA',
  region: 'Bordeaux',
  colour: 'Rouge',
  vintage: 2018,
  onAddToCellar: jest.fn(),
  onDelete: jest.fn(),
};

describe('WishlistCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render bottle name and vintage', () => {
    render(<WishlistCard {...defaultProps} />);
    expect(screen.getByText('Château Margaux 2018')).toBeTruthy();
  });

  it('should render domain name', () => {
    render(<WishlistCard {...defaultProps} />);
    expect(screen.getByText('Château Margaux SCA')).toBeTruthy();
  });

  it('should render region', () => {
    render(<WishlistCard {...defaultProps} />);
    expect(screen.getByText('Bordeaux')).toBeTruthy();
  });

  it('should render colour', () => {
    render(<WishlistCard {...defaultProps} />);
    expect(screen.getByText('Rouge')).toBeTruthy();
  });

  it('should call onAddToCellar with id when add-to-cellar button is pressed', () => {
    render(<WishlistCard {...defaultProps} />);
    fireEvent.press(screen.getByTestId('add-to-cellar-1'));
    expect(defaultProps.onAddToCellar).toHaveBeenCalledWith(1);
  });

  it('should call onDelete with id when delete button is pressed', () => {
    render(<WishlistCard {...defaultProps} />);
    fireEvent.press(screen.getByTestId('delete-wishlist-1'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
  });

  it('should use correct testIDs based on id prop', () => {
    render(<WishlistCard {...defaultProps} id={42} />);
    expect(screen.getByTestId('add-to-cellar-42')).toBeTruthy();
    expect(screen.getByTestId('delete-wishlist-42')).toBeTruthy();
  });
});
