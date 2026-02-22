import { ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/authentication/AuthContext";
import AddOrUpdateBottleForm from "../components/AddOrUpdateBottleForm";
import { cellarService } from "@/services/CellarService";
import BackButton from "../components/BackButton";

export default function UpdateBottlePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams();

  const handleSubmit = async (formData: any) => {
    if (!token || !id) {
      Alert.alert("Erreur", "Informations manquantes");
      return;
    }

    try {
      await cellarService.updateCellarItem(token, Number(id), formData);

      Alert.alert(
        "Succès",
        "Bouteille modifiée avec succès !",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      let errorMessage = "Impossible de modifier la bouteille";

      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        errorMessage = Object.values(validationErrors).flat().join("\n");
      } else {
        errorMessage = error.message;
      }

      Alert.alert("Erreur", errorMessage);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-app">
      <AddOrUpdateBottleForm
        mode="update"
        bottleId={Number(id)}
        token={token || undefined}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}