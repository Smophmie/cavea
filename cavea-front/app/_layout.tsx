import { Stack, Redirect } from "expo-router";
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { AuthProvider, useAuth } from "../authentication/AuthContext";

function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return <Redirect href="/loading" />;
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/protected/dashboard" />;
}

export default function RootLayout() {
  useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="registration" />
        <Stack.Screen name="loading" />
        <Stack.Screen name="protected" />
      </Stack>
      <RootNavigator />
    </AuthProvider>
  );
}
