import "../global.css"
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';
import PrimaryButton from "./components/PrimaryButton"
import SecondaryButton from "./components/SecondaryButton";

const Logo = require('@/assets/images/cavea-logo.png');

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-app px-4">
      <Image 
        source={Logo}
        style={{ width: 150, height: 150 }}
      />
      <Text className="text-3xl font-bold mb-8">Bienvenue sur l’app !</Text>
      <PrimaryButton
        text="Créer un compte"
        onPress={() => router.push("/registration")}
      />
      <SecondaryButton
        text="Se connecter"
        onPress={() => router.push("/login")}
      />
    </View>
  );
}

