import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import BackButton from '../BackButton';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe('BackButton', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('should render successfully', () => {
    const { UNSAFE_root } = render(<BackButton />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { UNSAFE_root } = render(<BackButton color="#bb2700" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should call router.back() when pressed', () => {
    const { UNSAFE_root } = render(<BackButton />);
    const touchable = UNSAFE_root.findByType(TouchableOpacity);
    
    fireEvent.press(touchable);
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('should call router.back() multiple times', () => {
    const { UNSAFE_root } = render(<BackButton />);
    const touchable = UNSAFE_root.findByType(TouchableOpacity);
    
    fireEvent.press(touchable);
    fireEvent.press(touchable);
    
    expect(mockBack).toHaveBeenCalledTimes(2);
  });
});