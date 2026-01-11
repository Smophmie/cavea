import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // First connection check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? false);
      setIsChecking(false);
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, isChecking };
};