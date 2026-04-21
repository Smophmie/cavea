import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export function useStorageState(key: string) {
  const [state, setState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const value = await SecureStore.getItemAsync(key);
      setState(value);
      setLoading(false);
    };
    load();
  }, [key]);

  const setValue = async (value: string | null) => {
    if (value === null) {
      await SecureStore.deleteItemAsync(key);
      setState(null);
    } else {
      await SecureStore.setItemAsync(key, value);
      setState(value);
    }
  };

  return [state, setValue, loading] as const;
}
