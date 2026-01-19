import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheService = {
  set: async (key: string, data: any) => {
    try {
      const jsonData = JSON.stringify({
        data,
        timestamp: Date.now()
      });
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error(`Error saving cache for ${key}:`, error);
    }
  },

  get: async (key: string) => {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData) {
        const parsed = JSON.parse(jsonData);
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error(`Error reading cache for ${key}:`, error);
      return null;
    }
  },

  clear: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing cache for ${key}:`, error);
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
};