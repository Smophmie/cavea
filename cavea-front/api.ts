import { Platform } from 'react-native';

export const baseURL =
  Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;