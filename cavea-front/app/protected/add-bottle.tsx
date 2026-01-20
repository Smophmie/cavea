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
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'ajouter la bouteille"
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-app">
      <AddOrUpdateBottleForm
        mode="add"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ScrollView>
  );
}