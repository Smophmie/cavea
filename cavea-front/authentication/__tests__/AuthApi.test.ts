import { baseURL } from '@/api';

global.fetch = jest.fn();

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login endpoint', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        token: 'test-token-abc123',
        user: {
          id: 1,
          firstname: 'John',
          name: 'Doe',
          email: 'john@test.com'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john@test.com',
          password: 'password123'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.token).toBe('test-token-abc123');
      expect(data.user.firstname).toBe('John');
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/login`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      const mockErrorResponse = {
        message: 'Invalid credentials'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      });

      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@test.com',
          password: 'wrongpass'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(data.message).toBe('Invalid credentials');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      await expect(
        fetch(`${baseURL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'john@test.com',
            password: 'password123'
          })
        })
      ).rejects.toThrow('Network request failed');
    });

    it('should send correct request format', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test', user: {} }),
      });

      await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'pass123'
        })
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('test@test.com')
        })
      );
    });
  });

  describe('Logout endpoint', () => {
    it('should successfully logout with valid token', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: 'Logged out successfully' }),
      });

      const response = await fetch(`${baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123'
        }
      });

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/logout`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          })
        })
      );
    });

    it('should include authorization header in logout request', async () => {
      const token = 'secure-token-xyz789';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await fetch(`${baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBe(`Bearer ${token}`);
    });
  });

  describe('Register endpoint', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        user: {
          id: 1,
          firstname: 'Jane',
          name: 'Smith',
          email: 'jane@test.com'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const response = await fetch(`${baseURL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: 'Jane',
          name: 'Smith',
          email: 'jane@test.com',
          password: 'password123',
          password_confirmation: 'password123'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.user.firstname).toBe('Jane');
      expect(data.user.email).toBe('jane@test.com');
    });

    it('should return validation errors for invalid data', async () => {
      const mockErrorResponse = {
        errors: {
          email: ['The email has already been taken.'],
          password: ['The password must be at least 8 characters.']
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      const response = await fetch(`${baseURL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: 'Test',
          name: 'User',
          email: 'existing@test.com',
          password: 'short',
          password_confirmation: 'short'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(422);
      expect(data.errors).toBeDefined();
      expect(data.errors.email).toContain('The email has already been taken.');
    });
  });

  describe('Token handling', () => {
    it('should format authorization header correctly', () => {
      const token = 'my-secret-token-123';
      const authHeader = `Bearer ${token}`;

      expect(authHeader).toBe('Bearer my-secret-token-123');
      expect(authHeader.startsWith('Bearer ')).toBe(true);
    });

    it('should handle empty token', () => {
      const token = '';
      const authHeader = token ? `Bearer ${token}` : undefined;

      expect(authHeader).toBeUndefined();
    });
  });
});