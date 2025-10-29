import { useState } from "react";
import { View, Text, TextInput, ActivityIndicator, ScrollView } from "react-native";
import PrimaryButton from "./components/PrimaryButton";
import BackButton from "./components/BackButton";
import { useRouter } from "expo-router";
import { baseURL } from "../api";
import PageTitle from "./components/PageTitle";

export default function RegistrationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (password !== passwordConfirmation) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          firstname,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();
      console.log("Response:", response.status, data);
      if (response.ok) {
        setMessage(`Compte créé avec succès. Bienvenue ${data.user.firstname}, vous pouvez maintenant vous connecter !`);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.message || "Erreur lors de la création du compte");
      }
    } catch (error: any) {
      setMessage("Impossible de contacter le serveur.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-app px-6"
      contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
    >
      
      <PageTitle text="Créer un compte" color="wine"></PageTitle>
      <Text className="text-center text-gray text-lg mb-9">
        Commencez à gérer votre cave.
      </Text>

      <TextInput
        placeholder="Prénom"
        value={firstname}
        onChangeText={setFirstname}
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 w-full"
      />

      <TextInput
        placeholder="Nom"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 w-full"
      />


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
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 w-full"
      />

      <TextInput
        placeholder="Confirmez le mot de passe"
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        secureTextEntry
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 w-full"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#800020" className="mb-4" />
      ) : (
        <PrimaryButton text="Créer mon compte" onPress={handleRegister} />
      )}

      {message ? (
        <Text
          className={`text-center text-lg mt-4 ${
            message.includes("succès") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </Text>
      ) : null}
    </ScrollView>
  );
}

