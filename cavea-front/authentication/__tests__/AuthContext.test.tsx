import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('../useStorageState', () => ({
  useStorageState: jest.fn(() => [null, jest.fn(), false]),
}));

jest.mock('@/api', () => ({
  baseURL: 'http://localhost',
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext — login()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null and store token on successful login', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'abc123', user: { firstname: 'Sophie' } }),
    }) as any;

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: string | null = 'not-called';
    await act(async () => {
      error = await result.current.login('user@test.com', 'password');
    });

    expect(error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost/login',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should return EMAIL_NOT_VERIFIED on 403 with email_not_verified flag', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        message: "Votre adresse email n'a pas encore été vérifiée.",
        email_not_verified: true,
      }),
    }) as any;

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: string | null = null;
    await act(async () => {
      error = await result.current.login('user@test.com', 'password');
    });

    expect(error).toBe('EMAIL_NOT_VERIFIED');
  });

  it('should return error message on other login failures', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Mot de passe invalide.' }),
    }) as any;

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: string | null = null;
    await act(async () => {
      error = await result.current.login('user@test.com', 'wrongpassword');
    });

    expect(error).toBe('Mot de passe invalide.');
  });

  it('should return server error message on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: string | null = null;
    await act(async () => {
      error = await result.current.login('user@test.com', 'password');
    });

    expect(error).toBe('Impossible de se connecter au serveur.');
  });

  it('should return fallback message when server returns no message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as any;

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: string | null = null;
    await act(async () => {
      error = await result.current.login('user@test.com', 'password');
    });

    expect(error).toBe('Erreur lors de la connexion');
  });
});
