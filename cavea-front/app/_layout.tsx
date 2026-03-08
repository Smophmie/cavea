import { Stack } from "expo-router";
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { AuthProvider } from "../authentication/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="registration" />
          <Stack.Screen name="loading" />
          <Stack.Screen name="protected" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}