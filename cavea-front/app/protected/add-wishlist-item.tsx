import { ScrollView, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useAuth } from "@/authentication/AuthContext";
import AddOrUpdateBottleForm from "../components/AddOrUpdateBottleForm";
import { wishlistService } from "@/services/WishlistService";

export default function AddWishlistItemPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [formKey, setFormKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFormKey(prev => prev + 1);
    }, [])
  );

  const handleSubmit = async (formData: any) => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    try {
      await wishlistService.createWishlistItem(token, {
        bottle: formData.bottle,
        ...(formData.vintage && { vintage: formData.vintage }),
        ...(formData.appellation_name && { appellation_name: formData.appellation_name }),
      });

      Alert.alert(
        "Succès",
        "Bouteille ajoutée à votre liste de souhaits !",
        [{ text: "OK", onPress: () => router.replace("/protected/wishlist") }]
      );
    } catch (error: any) {
      let errorMessage = "Impossible d'ajouter à la liste de souhaits";

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
    <ScrollView
      className="flex-1 bg-app"
      accessibilityRole="scrollbar"
      accessibilityLabel="Formulaire d'ajout à la liste de souhaits"
    >
      <AddOrUpdateBottleForm
        key={formKey}
        mode="wishlist"
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}
