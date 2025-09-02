import "../global.css"
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';
import PrimaryButton from "./components/PrimaryButton"
import SecondaryButton from "./components/SecondaryButton";
import CardIconText from "./components/CardIconText";
import PageTitle from "./components/PageTitle";

const Logo = require('@/assets/images/cavea-logo.png');

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-app px-6">
      <Image 
        source={Logo}
        style={{ width: 150, height: 150 }}
      />
      <PageTitle text = "Gérez votre cave à vin avec passion et expertise." color="wine"></PageTitle>

      <View className="my-6">
        <View className="flex-row gap-5 my-2">
          <CardIconText text="Gérez vos bouteilles" icon="Wine" />
          <CardIconText text="Notez vos dégustations" icon="Star" />
        </View>
        <View className="flex-row gap-5 my-2">
          <CardIconText text="Consommez au bon moment" icon="Hourglass" />
          <CardIconText text="Créez votre liste d'envies" icon="Heart" />
        </View>
      </View>

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

