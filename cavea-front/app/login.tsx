import { useState } from "react";
import { View, Text, TextInput, ActivityIndicator, ScrollView } from "react-native";
import PrimaryButton from "./components/PrimaryButton";
import TextLink from "./components/TextLink";
import { router } from "expo-router";
import PageTitle from "./components/PageTitle";
import { useAuth } from "@/authentication/AuthContext";
import { Image } from "expo-image";
import BackButton from "./components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";

const Logo = require('@/assets/images/cavea-logo.png');

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, token } = useAuth();

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-app">
      <ScrollView
        className="p-4"
        contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="w-full">
          <BackButton color="#730b1e" />
        </View>
        
        <Image 
          source={Logo}
          style={{ width:"60%",height: 100, margin: 20 }}
        />

        <View className="border border-lightgray rounded-lg px-6 m-6 py-14 w-full bg-white"> 
          <View className="flex-col items-center">
          <PageTitle text="Connexion" color="black"></PageTitle>
          </View>

          <Text className="text-center text-gray text-lg mb-9">
            Retrouvez votre cave à vin.
          </Text>

          <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 w-full"
          />

          <TextInput
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-lg px-4 py-3 mb-6 w-full"
          />

          {loading ? (
              <ActivityIndicator size="large" color="#800020" className="mb-4" />
          ) : (
              <PrimaryButton text="Connexion" onPress={handleLogin} />
          )}

          {error && <Text className="text-red-600 text-center">{error}</Text>}

          <Text className="mt-9 text-lg text-gray">Pas encore de compte?</Text>
          <TextLink
              text="Créer mon compte"
              className="text-lg"
              onPress={() => router.push("/registration")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
