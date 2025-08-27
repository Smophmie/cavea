import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useStorageState(key: string) {
  const [state, setState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const value = await AsyncStorage.getItem(key);
      setState(value);
      setLoading(false);
    };
    load();
  }, [key]);

  const setValue = async (value: string | null) => {
    if (value === null) {
      await AsyncStorage.removeItem(key);
      setState(null);
    } else {
      await AsyncStorage.setItem(key, value);
      setState(value);
    }
  };

  return [state, setValue, loading] as const;
}
