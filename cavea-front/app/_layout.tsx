import { Stack } from "expo-router";
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";

export default function RootLayout() {
  useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  return <Stack>
    <Stack.Screen 
      name="index"
      options={{
        title: "Accueil",
        headerShown: false,
      }} 
    />
    <Stack.Screen 
      name="login"
      options={{
        headerTitle : "",
      }}
    />
    <Stack.Screen 
      name="registration"
      options={{
        headerTitle : "",
      }}
    />
  </Stack>;
}
