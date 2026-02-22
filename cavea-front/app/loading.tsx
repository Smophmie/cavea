import { View, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Loading() {
  return (
    <SafeAreaView className="flex-1 bg-app">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#730b1e" />
        <Text className="mt-4">Chargement...</Text>
      </View>
    </SafeAreaView>
  );
}
