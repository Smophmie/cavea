import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WifiOff } from "lucide-react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function OfflineIndicator() {
  const { isOnline, isChecking } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isChecking) {
    return null;
  }

  if (isOnline) {
    return null;
  }

  return (
    <View
      className="bg-orange-500 px-4 py-2 flex-row items-center justify-center"
      style={{ paddingTop: insets.top + 8 }}
    >
      <WifiOff size={20} color="white" />
      <Text className="text-white text-base ml-2 font-semibold">
        Mode hors ligne - Données en cache
      </Text>
    </View>
  );
}