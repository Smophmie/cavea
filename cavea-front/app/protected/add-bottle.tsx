import { ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/authentication/AuthContext";
import AddOrUpdateBottleForm from "../components/AddOrUpdateBottleForm";
import { cellarService } from "@/services/CellarService";

export default function AddBottlePage() {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = async (formData: any) => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    try {
      await cellarService.createCellarItem(token, formData);

      Alert.alert(
        "Succès",
        "Bouteille ajoutée avec succès !",
        [
          {
            text: "OK",
            onPress: () => router.replace("/protected/dashboard"),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = "Impossible d'ajouter la bouteille";

      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        errorMessage = Object.values(validationErrors).flat().join("\n");
      } else {
        errorMessage = error.message;
      }

      Alert.alert("Erreur", errorMessage);
    }
  };

  return (
    <ScrollView className="flex-1 bg-app">
      <AddOrUpdateBottleForm
        mode="add"
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}