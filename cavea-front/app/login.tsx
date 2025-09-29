import { useState } from "react";
import { View, Text, TextInput, ActivityIndicator, ScrollView } from "react-native";
import PrimaryButton from "./components/PrimaryButton";
import TextLink from "./components/TextLink";
import { router } from "expo-router";
import PageTitle from "./components/PageTitle";
import { useAuth } from "@/authentication/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, token } = useAuth();

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <ScrollView
      className="flex-1 bg-white px-6"
      contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
    >
            
        <PageTitle text="Connexion" color="wine"></PageTitle>

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

        <Text className="mt-9 text-lg text-grey">Pas encore de compte?</Text>
        <TextLink
            text="Créer mon compte"
            className="text-lg"
            onPress={() => router.push("/registration")}
        />
    </ScrollView>
  );
}
