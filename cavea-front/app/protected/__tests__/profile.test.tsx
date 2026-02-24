import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import ProfilePage from '../profile';
import { userService } from '@/services/UserService';

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (cb: any) => { React.useEffect(cb, []); },
  };
});

jest.mock('@/authentication/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token', logout: mockLogout }),
}));

jest.mock('@/services/UserService', () => ({
  userService: {
    getMe: jest.fn(),
    getStats: jest.fn(),
    deleteAccount: jest.fn(),
  },
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

const mockProfile = { id: 1, name: 'Dupont', firstname: 'Sophie', email: 'sophie@test.com' };
const mockStats = { total_stock: 42, total_value: 1250.5, favourite_region: 'Bordeaux' };

describe('ProfilePage - chargement des données', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getMe as jest.Mock).mockResolvedValue(mockProfile);
    (userService.getStats as jest.Mock).mockResolvedValue(mockStats);
  });

  it('should display loading state initially', () => {
    (userService.getMe as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (userService.getStats as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<ProfilePage />);

    expect(screen.getAllByText('Chargement...').length).toBeGreaterThan(0);
  });

  it('should display user info after loading', async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Sophie')).toBeTruthy();
      expect(screen.getByText('Dupont')).toBeTruthy();
      expect(screen.getByText('sophie@test.com')).toBeTruthy();
    });
  });

  it('should display greeting with firstname', async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Bonjour, Sophie !')).toBeTruthy();
    });
  });

  it('should display stats after loading', async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeTruthy();
      expect(screen.getByText('1250.5 €')).toBeTruthy();
      expect(screen.getByText('Bordeaux')).toBeTruthy();
    });
  });

  it('should display stat card labels', async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Bouteilles en cave')).toBeTruthy();
      expect(screen.getByText('Valeur totale de ma cave')).toBeTruthy();
      expect(screen.getByText('Ma région préférée')).toBeTruthy();
    });
  });
});

describe('ProfilePage - valeurs nulles dans les statistiques', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should display "—" when total_value is null', async () => {
    (userService.getMe as jest.Mock).mockResolvedValue(mockProfile);
    (userService.getStats as jest.Mock).mockResolvedValue({
      ...mockStats,
      total_value: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should display "—" when favourite_region is null', async () => {
    (userService.getMe as jest.Mock).mockResolvedValue(mockProfile);
    (userService.getStats as jest.Mock).mockResolvedValue({
      ...mockStats,
      favourite_region: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('ProfilePage - suppression du compte', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getMe as jest.Mock).mockResolvedValue(mockProfile);
    (userService.getStats as jest.Mock).mockResolvedValue(mockStats);
    alertSpy = jest.spyOn(Alert, 'alert');
  });

  afterEach(() => alertSpy.mockRestore());

  it('should show confirmation alert when pressing delete button', async () => {
    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Supprimer mon compte'));
    fireEvent.press(screen.getByText('Supprimer mon compte'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Supprimer le compte',
      expect.stringContaining('irréversible'),
      expect.any(Array)
    );
  });

  it('should call deleteAccount and logout when confirming deletion', async () => {
    (userService.deleteAccount as jest.Mock).mockResolvedValue(undefined);

    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Supprimer mon compte'));
    fireEvent.press(screen.getByText('Supprimer mon compte'));

    const confirmButton = alertSpy.mock.calls[0][2].find(
      (btn: any) => btn.style === 'destructive'
    );
    confirmButton.onPress();

    await waitFor(() => {
      expect(userService.deleteAccount).toHaveBeenCalledWith('mock-token');
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('should not call deleteAccount when canceling', async () => {
    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Supprimer mon compte'));
    fireEvent.press(screen.getByText('Supprimer mon compte'));

    const cancelButton = alertSpy.mock.calls[0][2].find(
      (btn: any) => btn.style === 'cancel'
    );
    cancelButton.onPress?.();

    expect(userService.deleteAccount).not.toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('should show error alert when deletion fails', async () => {
    (userService.deleteAccount as jest.Mock).mockRejectedValue(new Error('Server error'));

    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Supprimer mon compte'));
    fireEvent.press(screen.getByText('Supprimer mon compte'));

    const confirmButton = alertSpy.mock.calls[0][2].find(
      (btn: any) => btn.style === 'destructive'
    );
    confirmButton.onPress();

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erreur',
        expect.stringContaining('suppression')
      );
    });
    expect(mockLogout).not.toHaveBeenCalled();
  });
});

describe('ProfilePage - liens et navigation', () => {
  let linkingSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getMe as jest.Mock).mockResolvedValue(mockProfile);
    (userService.getStats as jest.Mock).mockResolvedValue(mockStats);
    linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue();
  });

  afterEach(() => linkingSpy.mockRestore());

  it('should open email client when pressing contact button', async () => {
    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Envoyer un email'));
    fireEvent.press(screen.getByText('Envoyer un email'));

    expect(linkingSpy).toHaveBeenCalledWith(
      expect.stringContaining('mailto:')
    );
  });

  it('should include subject in contact email link', async () => {
    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Envoyer un email'));
    fireEvent.press(screen.getByText('Envoyer un email'));

    expect(linkingSpy).toHaveBeenCalledWith(
      expect.stringContaining('subject=')
    );
  });

  it('should open privacy policy URL', async () => {
    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Politique de confidentialité'));
    fireEvent.press(screen.getByText('Politique de confidentialité'));

    expect(linkingSpy).toHaveBeenCalledWith(
      'https://smophmie.github.io/cavea-privacy/'
    );
  });

  it('should navigate to legal-mentions page', async () => {
    render(<ProfilePage />);

    await waitFor(() => screen.getByText('Mentions légales'));
    fireEvent.press(screen.getByText('Mentions légales'));

    expect(mockPush).toHaveBeenCalledWith('/protected/legal-mentions');
  });
});
