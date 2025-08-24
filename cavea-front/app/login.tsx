import { useState } from "react";
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { baseURL } from "../api";
import PrimaryButton from "./components/PrimaryButton";
import TextLink from "./components/TextLink";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PageTitle from "./components/PageTitle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Connexion réussie ! Bonjour ${data.user.firstname}`);
        await AsyncStorage.setItem("authToken", data.token);
        setTimeout(() => router.replace("/(tabs)/dashboard"), 2000);
      } else {
        setMessage(data.message || "Erreur lors de la connexion");
      }
    } catch (error) {
      setMessage("Impossible de se connecter au serveur.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-6 bg-white">
            
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

        {message ? (
            <Text className={`text-center text-lg ${message.includes("réussie") ? "text-green-600" : "text-red-600"}`}>
            {message}
            </Text>
        ) : null}

        <Text className="mt-9 text-lg text-grey">Pas encore de compte?</Text>
        <TextLink
            text="Créer mon compte"
            className="text-lg"
            onPress={() => router.push("/registration")}
        />
    </View>
  );
}
