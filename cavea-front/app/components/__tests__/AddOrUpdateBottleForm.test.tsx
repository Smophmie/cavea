import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import AddOrUpdateBottleForm from '../AddOrUpdateBottleForm';

jest.mock('@/services/CellarService', () => ({
  cellarService: {
    getCellarItemById: jest.fn(),
  },
}));

describe('AddOrUpdateBottleForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering in ADD mode', () => {
    it('should render all required fields in add mode', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
          
        />
      );

      expect(screen.getByText('Ajouter une bouteille')).toBeTruthy();
      expect(screen.getByText('Nom de la bouteille *')).toBeTruthy();
      expect(screen.getByText('Domaine *')).toBeTruthy();
      expect(screen.getByText('Appellation (AOC/AOP)')).toBeTruthy();
      expect(screen.getByText('Cépages')).toBeTruthy();
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

      fireEvent.press(screen.getByText('Sélectionnez une région'));
      fireEvent.press(screen.getByText('Bordeaux'));

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
              domain_name: 'Domaine test',
              region_id: 3,
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
      fireEvent.press(screen.getByText('Sélectionnez une région'));
      fireEvent.press(screen.getByText('Bordeaux'));
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
      fireEvent.press(screen.getByText('Sélectionnez une région'));
      fireEvent.press(screen.getByText('Bordeaux'));
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 2015'), '2020');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 6'), '5');

      fireEvent.press(screen.getByText('Ajouter'));

      await waitFor(() => {
        const callArg = mockOnSubmit.mock.calls[0][0];
        expect(callArg.appellation_name).toBeUndefined();
        expect(callArg.price).toBeUndefined();
        expect(callArg.shop).toBeUndefined();
      });
    });
  });
 
  describe('Cancel button', () => {
    it('should call onCancel when cancel is pressed', () => {
      const mockOnCancel = jest.fn();
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
          domain_name: 'Test Domain',
          colour_id: 2,
          region_id: 1,
          grape_variety_ids: [],
        },
        vintage: {
          year: '2018',
        },
        appellation_name: 'Test Appellation',
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

  describe('Rating System', () => {

    it('should not submit rating if not set', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText("Ex: A l'ombre du figuier"), 'Test Bottle');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: Mas de la Seranne'), 'Test Domain');
      fireEvent.press(screen.getByText('Sélectionnez une couleur'));
      fireEvent.press(screen.getByText('Rouge'));
      fireEvent.press(screen.getByText('Sélectionnez une région'));
      fireEvent.press(screen.getByText('Bordeaux'));
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 2015'), '2020');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 6'), '5');

      fireEvent.press(screen.getByText('Ajouter'));

      await waitFor(() => {
        const callArg = mockOnSubmit.mock.calls[0][0];
        expect(callArg.rating).toBeUndefined();
      });
    });
  });

  describe('Grape Varieties Selection', () => {
    it('should open grape varieties modal when clicking the button', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.press(screen.getByText('Ajouter des cépages'));

      expect(screen.getByText('Sélectionnez des cépages')).toBeTruthy();
    });

    it('should close grape varieties modal when clicking X button', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.press(screen.getByText('Ajouter des cépages'));
      expect(screen.getByText('Sélectionnez des cépages')).toBeTruthy();

      fireEvent.press(screen.getByTestId('close-modal-grape-varieties'));

      expect(screen.queryByText('Sélectionnez des cépages')).toBeNull();
    });

    it('should select a single grape variety', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.press(screen.getByText('Ajouter des cépages'));

      fireEvent.press(screen.getByText('Cabernet Sauvignon'));

      fireEvent.press(screen.getByTestId('close-modal-grape-varieties'));

      expect(screen.getByText('Cabernet Sauvignon')).toBeTruthy();
    });

    it('should select multiple grape varieties', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.press(screen.getByText('Ajouter des cépages'));

      fireEvent.press(screen.getByText('Merlot'));
      fireEvent.press(screen.getByText('Cabernet Franc'));
      fireEvent.press(screen.getByText('Syrah'));

      fireEvent.press(screen.getByTestId('close-modal-grape-varieties'));

      expect(screen.getByText('Merlot')).toBeTruthy();
      expect(screen.getByText('Cabernet Franc')).toBeTruthy();
      expect(screen.getByText('Syrah')).toBeTruthy();
    });

    it('should show checkmark for selected grape varieties in modal', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.press(screen.getByText('Ajouter des cépages'));

      fireEvent.press(screen.getByText('Grenache'));

      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it('should submit form with selected grape varieties', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText("Ex: A l'ombre du figuier"), 'Test Bottle');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: Mas de la Seranne'), 'Test Domain');
      fireEvent.press(screen.getByText('Sélectionnez une couleur'));
      fireEvent.press(screen.getByText('Rouge'));
      fireEvent.press(screen.getByText('Sélectionnez une région'));
      fireEvent.press(screen.getByText('Bordeaux'));
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 2015'), '2020');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 6'), '5');

      // Select grape varieties
      fireEvent.press(screen.getByText('Ajouter des cépages'));
      fireEvent.press(screen.getByText('Merlot'));
      fireEvent.press(screen.getByText('Cabernet Sauvignon'));

      fireEvent.press(screen.getByTestId('close-modal-grape-varieties'));

      fireEvent.press(screen.getByText('Ajouter'));

      await waitFor(() => {
        const callArg = mockOnSubmit.mock.calls[0][0];
        expect(callArg.bottle.grape_variety_ids).toEqual(expect.arrayContaining([3, 1]));
        expect(callArg.bottle.grape_variety_ids.length).toBe(2);
      });
    });

    it('should submit form without grape varieties when none selected', async () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText("Ex: A l'ombre du figuier"), 'Test Bottle');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: Mas de la Seranne'), 'Test Domain');
      fireEvent.press(screen.getByText('Sélectionnez une couleur'));
      fireEvent.press(screen.getByText('Rouge'));
      fireEvent.press(screen.getByText('Sélectionnez une région'));
      fireEvent.press(screen.getByText('Bordeaux'));
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 2015'), '2020');
      fireEvent.changeText(screen.getByPlaceholderText('Ex: 6'), '5');

      fireEvent.press(screen.getByText('Ajouter'));

      await waitFor(() => {
        const callArg = mockOnSubmit.mock.calls[0][0];
        expect(callArg.bottle.grape_variety_ids).toBeUndefined();
      });
    });

    it('should change button text when grape varieties are selected', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Ajouter des cépages')).toBeTruthy();

      fireEvent.press(screen.getByText('Ajouter des cépages'));
      fireEvent.press(screen.getByText('Gamay'));

      fireEvent.press(screen.getByTestId('close-modal-grape-varieties'));

      expect(screen.getByText('Modifier les cépages')).toBeTruthy();
      expect(screen.queryByText('Ajouter des cépages')).toBeNull();
    });

    it('should preserve grape variety selection when reopening modal', () => {
      render(
        <AddOrUpdateBottleForm
          mode="add"
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.press(screen.getByText('Ajouter des cépages'));
      fireEvent.press(screen.getByText('Cinsault'));
      fireEvent.press(screen.getByText('Cabernet Sauvignon'));

      fireEvent.press(screen.getByTestId('close-modal-grape-varieties'));

      // Reopen modal
      fireEvent.press(screen.getByText('Modifier les cépages'));

      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks.length).toBeGreaterThanOrEqual(2);
    });
  });
});