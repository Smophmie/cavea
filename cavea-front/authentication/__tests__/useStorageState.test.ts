import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStorageState } from '../useStorageState';

describe('useStorageState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null and loading true', () => {
    const { result } = renderHook(() => useStorageState('test-key'));
    
    expect(result.current[0]).toBeNull();
    expect(result.current[2]).toBe(true);
  });

  it('should load existing value from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('stored-value');

    const { result } = renderHook(() => useStorageState('test-key'));

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
      expect(result.current[0]).toBe('stored-value');
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should remain null if no value exists in storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useStorageState('test-key'));

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[0]).toBeNull();
  });

  it('should save value to AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useStorageState('test-key'));

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    await act(async () => {
      await result.current[1]('new-value');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'new-value');
    expect(result.current[0]).toBe('new-value');
  });

  it('should remove value from AsyncStorage when set to null', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('existing-value');

    const { result } = renderHook(() => useStorageState('test-key'));

    await waitFor(() => {
      expect(result.current[0]).toBe('existing-value');
    });

    await act(async () => {
      await result.current[1](null);
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(result.current[0]).toBeNull();
  });

  it('should update state when setValue is called multiple times', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useStorageState('test-key'));

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    await act(async () => {
      await result.current[1]('value-1');
    });

    expect(result.current[0]).toBe('value-1');

    await act(async () => {
      await result.current[1]('value-2');
    });

    expect(result.current[0]).toBe('value-2');
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
  });
});