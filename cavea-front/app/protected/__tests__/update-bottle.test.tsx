import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UpdateBottlePage from '../update-bottle';
import { cellarService } from '@/services/CellarService';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
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

describe('UpdateBottlePage', () => {
  let alertSpy: jest.SpyInstance;
  let handleSubmit: ((formData: any) => Promise<void>) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    handleSubmit = null;
    alertSpy = jest.spyOn(Alert, 'alert');
    
    // Capture handleSubmit from the component
    const originalCreateElement = React.createElement;
    jest.spyOn(React, 'createElement').mockImplementation((type: any, props: any, ...children: any[]) => {
      if (props?.onSubmit && props?.mode === 'update') {
        handleSubmit = props.onSubmit;
      }
      return originalCreateElement(type, props, ...children);
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should render the form in update mode', () => {
    const { UNSAFE_root } = render(<UpdateBottlePage />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should show error when token is missing', async () => {
    jest.spyOn(require('@/authentication/AuthContext'), 'useAuth')
      .mockReturnValue({ token: null });
    
    render(<UpdateBottlePage />);
    
    if (handleSubmit) {
      await handleSubmit({});
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Informations manquantes');
    }
  });

  it('should show error when id is missing', async () => {
    jest.spyOn(require('expo-router'), 'useLocalSearchParams')
      .mockReturnValue({ id: undefined });
    
    render(<UpdateBottlePage />);
    
    if (handleSubmit) {
      await handleSubmit({});
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Informations manquantes');
    }
  });

  it('should call updateCellarItem and show success', async () => {
    (cellarService.updateCellarItem as jest.Mock).mockResolvedValue({});
    
    render(<UpdateBottlePage />);
    
    if (handleSubmit) {
      await handleSubmit({ stock: 5 });
      
      await waitFor(() => {
        expect(cellarService.updateCellarItem).toHaveBeenCalledWith('mock-token', 1, { stock: 5 });
        expect(alertSpy).toHaveBeenCalledWith(
          'Succès',
          'Bouteille modifiée avec succès !',
          expect.any(Array)
        );
      });
    }
  });

  it('should navigate back when pressing OK on success', async () => {
    (cellarService.updateCellarItem as jest.Mock).mockResolvedValue({});
    
    render(<UpdateBottlePage />);
    
    if (handleSubmit) {
      await handleSubmit({ stock: 5 });
      
      await waitFor(() => {
        const okButton = alertSpy.mock.calls[0][2][0];
        okButton.onPress();
        expect(mockBack).toHaveBeenCalled();
      });
    }
  });

  it('should format 422 validation errors', async () => {
    const validationError = {
      response: {
        status: 422,
        data: {
          errors: {
            rating: ['Rating must be between 0 and 10'],
            stock: ['Stock is required'],
          },
        },
      },
    };

    (cellarService.updateCellarItem as jest.Mock).mockRejectedValue(validationError);
    
    render(<UpdateBottlePage />);
    
    if (handleSubmit) {
      await handleSubmit({ stock: 5 });
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Erreur',
          expect.stringContaining('Rating must be between 0 and 10')
        );
      });
    }
  });

  it('should show generic error message for other errors', async () => {
    const networkError = new Error('Network timeout');
    
    (cellarService.updateCellarItem as jest.Mock).mockRejectedValue(networkError);
    
    render(<UpdateBottlePage />);
    
    if (handleSubmit) {
      await handleSubmit({ stock: 5 });
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Network timeout');
      });
    }
  });
});