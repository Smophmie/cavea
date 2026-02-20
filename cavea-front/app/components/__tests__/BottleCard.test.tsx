import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import BottleCard from '../BottleCard';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('BottleCard - Rating Display', () => {
  const baseProps = {
    id: 1,
    bottleName: 'Château Test',
    domainName: 'Domaine Test',
    region: 'Bordeaux',
    quantity: 6,
    vintage: 2020,
    color: 'Rouge',
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should not display rating when showRating is false', () => {
    render(
      <BottleCard
        {...baseProps}
        rating={7}
        showRating={false}
      />
    );

    expect(screen.queryByText('7/10')).toBeNull();
  });

  it('should not display rating when rating is undefined', () => {
    render(
      <BottleCard
        {...baseProps}
        showRating={true}
      />
    );

    expect(screen.queryByText('/10')).toBeNull();
  });

  it('should display full star rating', () => {
    render(
      <BottleCard
        {...baseProps}
        rating={8}
        showRating={true}
      />
    );

    expect(screen.getByText('8/10')).toBeTruthy();
  });

  it('should display half star rating', () => {
    render(
      <BottleCard
        {...baseProps}
        rating={7.5}
        showRating={true}
      />
    );

    expect(screen.getByText('7.5/10')).toBeTruthy();
  });
});

describe('BottleCard - Bottle Info Display', () => {
  const baseProps = {
    id: 1,
    bottleName: 'Château Test',
    domainName: 'Domaine Test',
    region: 'Bordeaux',
    quantity: 6,
    vintage: 2020,
    color: 'Rouge',
  };

  it('should display bottle info', () => {
    render(
      <BottleCard
        {...baseProps}
        rating={8.5}
        showRating={true}
      />
    );

    expect(screen.getByText('Château Test 2020')).toBeTruthy();
    expect(screen.getByText('Domaine Test')).toBeTruthy();
    expect(screen.getByText('Bordeaux')).toBeTruthy();
    expect(screen.getByText('x6')).toBeTruthy();
    expect(screen.getByText('8.5/10')).toBeTruthy();
  });
});

describe('BottleCard - Price Display', () => {
  const baseProps = {
    id: 1,
    bottleName: 'Château Test',
    domainName: 'Domaine Test',
    region: 'Bordeaux',
    quantity: 6,
    vintage: 2020,
    color: 'Rouge',
  };

  it('should display price when provided', () => {
    render(
      <BottleCard
        {...baseProps}
        price={25.50}
        rating={7}
        showRating={true}
      />
    );

    expect(screen.getByText('25.5€')).toBeTruthy();
    expect(screen.getByText('7/10')).toBeTruthy();
  });
});

describe('BottleCard - Navigation', () => {
  const baseProps = {
    id: 42,
    bottleName: 'Château Navigation',
    domainName: 'Domaine Test',
    region: 'Bordeaux',
    quantity: 6,
    vintage: 2020,
    color: 'Rouge',
  };

  it('should navigate to bottle detail when pressed', () => {
    const { getByText } = render(<BottleCard {...baseProps} />);
    
    const card = getByText('Château Navigation 2020');
    fireEvent.press(card.parent.parent);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/protected/bottle-detail',
      params: { id: 42, bottleName: 'Château Navigation' },
    });
  });
});