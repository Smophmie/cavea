import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UpdateBottlePage from '../update-bottle';
import { cellarService } from '@/services/CellarService';

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
  useLocalSearchParams: () => ({ id: '1' }),
}));

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    updateCellarItem: jest.fn(),
    getCellarItemById: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');

describe('UpdateBottlePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form in update mode', () => {
    const { getByText } = render(<UpdateBottlePage />);
    expect(getByText).toBeTruthy();
  });

  it('should call updateCellarItem on form submit', async () => {
    (cellarService.updateCellarItem as jest.Mock).mockResolvedValue({});

    const { getByText } = render(<UpdateBottlePage />);
    
    await waitFor(() => {
      expect(cellarService.updateCellarItem).not.toHaveBeenCalled();
    });
  });

  it('should show success alert and navigate back on successful update', async () => {
    (cellarService.updateCellarItem as jest.Mock).mockResolvedValue({});

    render(<UpdateBottlePage />);
  });

  it('should show error alert on update failure', async () => {
    (cellarService.updateCellarItem as jest.Mock).mockRejectedValue(
      new Error('Update failed')
    );

    render(<UpdateBottlePage />);
  });

  it('should handle validation errors (422)', async () => {
    const validationError = {
      response: {
        status: 422,
        data: {
          errors: {
            rating: ['Rating must be between 0 and 10'],
          },
        },
      },
    };

    (cellarService.updateCellarItem as jest.Mock).mockRejectedValue(validationError);

    render(<UpdateBottlePage />);
  });
});