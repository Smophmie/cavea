import { act, renderHook, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus } from '../useNetworkStatus';

jest.mock('@react-native-community/netinfo');

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize as checking and online', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ isConnected: true });
    const mockAddEventListener = jest.fn().mockReturnValue(jest.fn());

    (NetInfo.fetch as jest.Mock) = mockFetch;
    (NetInfo.addEventListener as jest.Mock) = mockAddEventListener;

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isChecking).toBe(true);
    expect(result.current.isOnline).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });
  });

  it('should detect online status after initial fetch', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ isConnected: true });
    const mockAddEventListener = jest.fn().mockReturnValue(jest.fn());

    (NetInfo.fetch as jest.Mock) = mockFetch;
    (NetInfo.addEventListener as jest.Mock) = mockAddEventListener;

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
      expect(result.current.isOnline).toBe(true);
    });
  });

  it('should detect offline status', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ isConnected: false });
    const mockAddEventListener = jest.fn().mockReturnValue(jest.fn());

    (NetInfo.fetch as jest.Mock) = mockFetch;
    (NetInfo.addEventListener as jest.Mock) = mockAddEventListener;

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
      expect(result.current.isOnline).toBe(false);
    });
  });

  it('should update when network status changes', async () => {
    let networkListener: ((state: { isConnected: boolean }) => void) | undefined;

    const mockFetch = jest.fn().mockResolvedValue({ isConnected: true });
    const mockAddEventListener = jest.fn((listener) => {
      networkListener = listener;
      return jest.fn();
    });

    (NetInfo.fetch as jest.Mock).mockImplementation(mockFetch);
    (NetInfo.addEventListener as jest.Mock).mockImplementation(mockAddEventListener);

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });

    // Wrapper dans act
    await act(async () => {
      networkListener?.({ isConnected: false });
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
  });


  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn();
    const mockFetch = jest.fn().mockResolvedValue({ isConnected: true });
    const mockAddEventListener = jest.fn().mockReturnValue(mockUnsubscribe);

    (NetInfo.fetch as jest.Mock) = mockFetch;
    (NetInfo.addEventListener as jest.Mock) = mockAddEventListener;

    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});