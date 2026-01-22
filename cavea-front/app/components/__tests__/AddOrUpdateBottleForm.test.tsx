import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import AddOrUpdateBottleForm from '../AddOrUpdateBottleForm';

describe('AddOrUpdateBottleForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering in ADD mode', () => {
    it('should render all required fields in add mode', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Ajouter une bouteille')).toBeTruthy();
      expect(screen.getByText('Nom de la bouteille *')).toBeTruthy();
      expect(screen.getByText('Domaine *')).toBeTruthy();
      expect(screen.getByText('Appellation')).toBeTruthy();
    });

    it('should render Add button in add mode', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Ajouter')).toBeTruthy();
    });
  });

  describe('Rendering in UPDATE mode', () => {
    it('should render Modify button in update mode', () => {
      render(
        <AddOrUpdateBottleForm
          mode="update"
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Modifier')).toBeTruthy();
    });
  });

  describe('Form validation', () => {
    it('should show error when submitting without required fields', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Ajouter');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Le nom de la bouteille est requis')).toBeTruthy();
        expect(screen.getByText('La couleur est requise')).toBeTruthy();
        expect(screen.getByText('Le millésime est requis')).toBeTruthy();
        expect(screen.getByText('Le stock est requis')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate year range', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      const yearInput = screen.getByPlaceholderText('Ex: 2015');
      fireEvent.changeText(yearInput, '1800');

      const submitButton = screen.getByText('Ajouter');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Année invalide (1900-2100)')).toBeTruthy();
      });
    });

    it('should return an error if stock is negative', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      const stockInput = screen.getByPlaceholderText('Ex: 6');
      fireEvent.changeText(stockInput, '-5');

      const submitButton = screen.getByText('Ajouter');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Stock invalide (minimum 0)')).toBeTruthy();
      });
    });

    it('should validate drinking window dates', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      const startInput = screen.getByPlaceholderText('2025');
      const endInput = screen.getByPlaceholderText('2035');

      fireEvent.changeText(startInput, '2030');
      fireEvent.changeText(endInput, '2025');

      const submitButton = screen.getByText('Ajouter');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("L'année de fin doit être supérieure ou égale à l'année de début")
        ).toBeTruthy();
      });
    });
  });

  describe('Color selection', () => {
    it('should show color picker when clicked', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      const colorButton = screen.getByText('Sélectionnez une couleur');
      fireEvent.press(colorButton);

      expect(screen.getByText('Rouge')).toBeTruthy();
      expect(screen.getByText('Blanc')).toBeTruthy();
      expect(screen.getByText('Rosé')).toBeTruthy();
      expect(screen.getByText('Pétillant')).toBeTruthy();
      expect(screen.getByText('Orange')).toBeTruthy();
      expect(screen.getByText('Autre')).toBeTruthy();
    });
  });

  describe('Form submission', () => {
    it('should submit valid form data with correct types', async () => {
        render(
            <AddOrUpdateBottleForm
            mode="add"
            onSubmit={mockOnSubmit}
            />
        );

        fireEvent.changeText(
            screen.getByPlaceholderText("Ex: A l'ombre du figuier"),
            'Test Wine'
        );

        fireEvent.press(screen.getByText('Sélectionnez une couleur'));
        
        await waitFor(() => {
            expect(screen.getByText('Rouge')).toBeTruthy();
        });
    
        fireEvent.press(screen.getByText('Rouge'));

        fireEvent.changeText(screen.getByPlaceholderText('Ex: 2015'), '2020');
        fireEvent.changeText(screen.getByPlaceholderText('Ex: Mas de la Seranne'), 'Domaine test');
        fireEvent.changeText(screen.getByPlaceholderText('Ex: 6'), '5');
        fireEvent.changeText(screen.getByPlaceholderText('Ex: 15.50'), '25.50');

        const submitButton = screen.getByText('Ajouter');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    bottle: expect.objectContaining({
                    name: 'Test Wine',
                    domain: 'Domaine test',
                    colour_id: 1,
                    }),
                    vintage: expect.objectContaining({
                    year: 2020,
                    }),
                    stock: 5,
                    price: 25.50,
                })
            );
        });
    });

    it('should convert string inputs to numbers', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.changeText(
        screen.getByPlaceholderText("Ex: A l'ombre du figuier"),
        'Test'
      );
      fireEvent.changeText(screen.getByPlaceholderText('Ex: Mas de la Seranne'), 'Domaine test');
      fireEvent.press(screen.getByText('Sélectionnez une couleur'));
      fireEvent.press(screen.getByText('Rouge'));
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 2015'), '2020');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 6'), '3');

      fireEvent.press(screen.getByText('Ajouter'));

      await waitFor(() => {
        const callArg = mockOnSubmit.mock.calls[0][0];
        expect(typeof callArg.vintage.year).toBe('number');
        expect(typeof callArg.stock).toBe('number');
      });
    });

    it('should not include optional empty fields', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.changeText(
        screen.getByPlaceholderText("Ex: A l'ombre du figuier"),
        'Test Wine'
      );
      fireEvent.changeText(screen.getByPlaceholderText('Ex: Mas de la Seranne'), 'Domaine test');
      fireEvent.press(screen.getByText('Sélectionnez une couleur'));
      fireEvent.press(screen.getByText('Rouge'));
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 2015'), '2020');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 6'), '5');

      fireEvent.press(screen.getByText('Ajouter'));

      await waitFor(() => {
        const callArg = mockOnSubmit.mock.calls[0][0];
        expect(callArg.bottle.PDO).toBeUndefined();
        expect(callArg.price).toBeUndefined();
        expect(callArg.shop).toBeUndefined();
      });
    });
});
 
describe('Cancel button', () => {
    it('should call onCancel when cancel is pressed', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Annuler');
      fireEvent.press(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
});

  describe('Initial data', () => {
    it('should populate form with initial data', () => {
      const initialData = {
        bottle: {
          name: 'Existing Wine',
          domain: 'Test Domain',
          PDO: 'Test PDO',
          colour_id: 2,
        },
        vintage: {
          year: '2018',
        },
        stock: '10',
        price: '45.00',
      };

      render(
        <AddOrUpdateBottleForm
          mode="update"
          initialData={initialData}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByDisplayValue('10')).toBeTruthy();
      expect(screen.getByDisplayValue('45.00')).toBeTruthy();
    });
  });

  describe('Error clearing', () => {
    it('should clear error when user starts typing', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.press(screen.getByText('Ajouter'));

      await waitFor(() => {
        expect(screen.getByText('Le nom de la bouteille est requis')).toBeTruthy();
      });

      const nameInput = screen.getByPlaceholderText("Ex: A l'ombre du figuier");
      fireEvent.changeText(nameInput, 'T');

      await waitFor(() => {
        expect(screen.queryByText('Le nom de la bouteille est requis')).toBeNull();
      });
    });
  });
});
