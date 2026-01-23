import { ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/authentication/AuthContext";
import AddOrUpdateBottleForm from "../components/AddOrUpdateBottleForm";
import { cellarService } from "@/services/CellarService";

export default function AddBottlePage() {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = async (formData: any) => {
    console.log('[ADD_BOTTLE_PAGE] Form submission started', {
      formData,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });

    if (!token) {
      console.error('[ADD_BOTTLE_PAGE] No token available');
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    try {
      console.log('[ADD_BOTTLE_PAGE] Calling cellarService.createCellarItem');
      const result = await cellarService.createCellarItem(token, formData);

      console.log('[ADD_BOTTLE_PAGE] Cellar item created successfully', {
        result,
        timestamp: new Date().toISOString(),
      });

      Alert.alert(
        "Succès",
        "Bouteille ajoutée avec succès !",
        [
          {
            text: "OK",
            onPress: () => {
              console.log('[ADD_BOTTLE_PAGE] Redirecting to dashboard');
              router.replace("/protected/dashboard");
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('[ADD_BOTTLE_PAGE] Error creating cellar item', {
        error: error instanceof Error ? error.message : String(error),
        errorResponse: error.response,
        formData,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "Impossible d'ajouter la bouteille";

      if (error.response?.status === 422) {
        console.error('[ADD_BOTTLE_PAGE] Validation error (422)', error.response.data);
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
        mode="add"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ScrollView>
  );
}