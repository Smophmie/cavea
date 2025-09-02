import { View, ActivityIndicator, Text } from "react-native";

export default function Loading() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#800020" />
      <Text className="mt-4">Chargement...</Text>
    </View>
  );
}
