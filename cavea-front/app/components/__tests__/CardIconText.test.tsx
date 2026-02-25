import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CardIconText from '../CardIconText';

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return new Proxy({}, {
    get: (_: any, name: string) => {
      const MockIcon = ({ testID }: any) => <View testID={testID || `icon-${name}`} />;
      MockIcon.displayName = name;
      return MockIcon;
    },
  });
});

describe('CardIconText - text display', () => {
  it('should display the text prop', () => {
    render(<CardIconText text="42 bouteilles" icon="Wine" />);
    expect(screen.getByText('42 bouteilles')).toBeTruthy();
  });

  it('should display loading placeholder', () => {
    render(<CardIconText text="..." icon="Wine" />);
    expect(screen.getByText('...')).toBeTruthy();
  });

  it('should display dash when value is empty', () => {
    render(<CardIconText text="—" icon="MapPin" />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});

describe('CardIconText - label prop', () => {
  it('should display label when provided', () => {
    render(<CardIconText text="42" icon="Wine" label="Bouteilles en cave" />);
    expect(screen.getByText('Bouteilles en cave')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('should not display label when not provided', () => {
    render(<CardIconText text="42" icon="Wine" />);
    expect(screen.queryByText('Bouteilles en cave')).toBeNull();
  });

  it('should display label and value together', () => {
    render(
      <CardIconText
        text="1 250 €"
        icon="TrendingUp"
        label="Valeur totale de ma cave"
      />
    );
    expect(screen.getByText('Valeur totale de ma cave')).toBeTruthy();
    expect(screen.getByText('1 250 €')).toBeTruthy();
  });
});

describe('CardIconText - variant prop', () => {
  it('should render in row layout by default', () => {
    const { UNSAFE_root } = render(<CardIconText text="42" icon="Wine" />);
    const views = UNSAFE_root.findAllByType('View');
    const rowView = views.find(v => v.props.className?.includes('flex-row'));
    expect(rowView).toBeTruthy();
  });

  it('should render in row layout when variant="row"', () => {
    const { UNSAFE_root } = render(<CardIconText text="42" icon="Wine" variant="row" />);
    const views = UNSAFE_root.findAllByType('View');
    const rowView = views.find(v => v.props.className?.includes('flex-row'));
    expect(rowView).toBeTruthy();
  });

  it('should render in column layout when variant="column"', () => {
    const { UNSAFE_root } = render(<CardIconText text="42" icon="Wine" variant="column" />);
    const views = UNSAFE_root.findAllByType('View');
    const colView = views.find(v => v.props.className?.includes('flex-col'));
    expect(colView).toBeTruthy();
  });

  it('should display text in column variant', () => {
    render(<CardIconText text="Gérez vos bouteilles" icon="Wine" variant="column" />);
    expect(screen.getByText('Gérez vos bouteilles')).toBeTruthy();
  });

  it('should display label in column variant', () => {
    render(<CardIconText text="42" icon="Wine" label="Bouteilles en cave" variant="column" />);
    expect(screen.getByText('Bouteilles en cave')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });
});

describe('CardIconText - style override', () => {
  it('should render without error when style prop is provided', () => {
    const { UNSAFE_root } = render(
      <CardIconText text="42" icon="Wine" style={{ flex: 1, width: undefined }} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render without error when backgroundColor is provided', () => {
    render(
      <CardIconText
        text="42"
        icon="Wine"
        backgroundColor="rgba(255,255,255,0.1)"
        iconColor="#ffffff"
        textColor="text-white"
      />
    );
    expect(screen.getByText('42')).toBeTruthy();
  });
});
