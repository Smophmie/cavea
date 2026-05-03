import "../global.css"
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { Image } from 'expo-image';
import PrimaryButton from "./components/PrimaryButton"
import SecondaryButton from "./components/SecondaryButton";
import CardIconText from "./components/CardIconText";
import PageTitle from "./components/PageTitle";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/AuthContext";
import { useState } from "react";

const Logo = require('@/assets/images/logo.png');

const VINEYARD_PHOTOS = [
  { uri: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80' },
  { uri: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80' },
  { uri: 'https://images.unsplash.com/photo-1543364195-bfe17b227dc1?w=800&q=80' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = 200;

export default function Index() {
  const router = useRouter();
  const { token, storageLoading } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  if (storageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-app items-center justify-center">
        <ActivityIndicator size="large" color="#800020" />
      </SafeAreaView>
    );
  }

  if (token) {
    return <Redirect href="/protected/dashboard" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-app">
      <ScrollView
        className="p-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={Logo}
          style={{ width:"60%",height: 100, margin: 30 }}
        />

        <View style={{ width: SCREEN_WIDTH - 48, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48));
              setActiveIndex(index);
            }}
          >
            {VINEYARD_PHOTOS.map((photo, i) => (
              <Image
                key={i}
                source={photo}
                style={{ width: SCREEN_WIDTH - 48, height: PHOTO_HEIGHT }}
                contentFit="cover"
              />
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 8, width: '100%' }}>
            {VINEYARD_PHOTOS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 3,
                  backgroundColor: i === activeIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </View>
        </View>

        <PageTitle text = "Gérez votre cave à vin avec passion et expertise." color="wine"></PageTitle>

        <View className="my-6 w-full">
          <View className="flex-row gap-5 my-2">
            <CardIconText text="Gérez vos bouteilles" icon="Wine" variant="column" />
            <CardIconText text="Notez vos dégustations" icon="Star" variant="column" />
          </View>
          <View className="flex-row gap-5 my-2">
            <CardIconText text="Consommez au bon moment" icon="Hourglass" variant="column" />
            <CardIconText text="Créez votre liste d'envies" icon="Heart" variant="column" />
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
      </ScrollView>
    </SafeAreaView>
  );
}

