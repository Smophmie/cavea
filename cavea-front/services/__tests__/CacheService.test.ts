import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheService } from '../CacheService';

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should save data to AsyncStorage with timestamp', async () => {
      const key = 'test_key';
      const data = { name: 'Test Wine', stock: 5 };

      await cacheService.set(key, data);

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        key,
        expect.stringContaining('"name":"Test Wine"')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        key,
        expect.stringContaining('"timestamp"')
      );
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await cacheService.set('test_key', { data: 'test' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('should retrieve data from AsyncStorage', async () => {
      const mockData = { name: 'Test Wine', stock: 5 };
      const mockCacheData = JSON.stringify({
        data: mockData,
        timestamp: Date.now()
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockCacheData);

      const result = await cacheService.get('test_key');

      expect(result).toEqual(mockData);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test_key');
    });

    it('should return null if key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await cacheService.get('nonexistent_key');

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json');

      const result = await cacheService.get('test_key');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should remove item from AsyncStorage', async () => {
      await cacheService.clear('test_key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Remove error'));

      await cacheService.clear('test_key');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearAll', () => {
    it('should clear all items from AsyncStorage', async () => {
      await cacheService.clearAll();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.clear as jest.Mock).mockRejectedValueOnce(new Error('Clear error'));

      await cacheService.clearAll();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});