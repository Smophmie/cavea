import { ScrollView, Alert, ActivityIndicator, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/authentication/AuthContext";
import AddOrUpdateBottleForm from "../components/AddOrUpdateBottleForm";
import { cellarService } from "@/services/CellarService";
import { wishlistService } from "@/services/WishlistService";

export default function AddFromWishlistPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [initialData, setInitialData] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) {
      setLoading(false);
      return;
    }

    wishlistService
      .getWishlistItemById(token, Number(id))
      .then((item: any) => {
        setInitialData({
          bottle: {
            name: item.bottle.name,
            domain_name: item.bottle.domain.name,
            colour_id: item.bottle.colour.id,
            region_id: item.bottle.region?.id || null,
            grape_variety_ids: item.bottle.grapeVarieties?.map((gv: any) => gv.id) || [],
          },
          ...(item.vintage && { vintage: { year: String(item.vintage.year) } }),
          appellation_name: item.appellation?.name || "",
        });
      })
      .catch(() => {
        Alert.alert("Erreur", "Impossible de charger les données du vin", [
          { text: "OK", onPress: () => router.back() },
        ]);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleSubmit = async (formData: any) => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    try {
      await cellarService.createCellarItem(token, formData);

      try {
        await wishlistService.deleteWishlistItem(token, Number(id));
      } catch {
        console.warn("Could not remove wishlist item after adding to cellar");
      }

      Alert.alert("Succès", "Bouteille ajoutée à votre cave !", [
        { text: "OK", onPress: () => router.replace("/protected/dashboard") },
      ]);
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

  if (loading) {
    return (
      <View
        className="flex-1 bg-app items-center justify-center"
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Chargement des données du vin"
      >
        <ActivityIndicator size="large" color="#730b1e" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-app"
      accessibilityRole="scrollbar"
      accessibilityLabel="Formulaire d'ajout à la cave depuis la liste de souhaits"
    >
      <AddOrUpdateBottleForm
        mode="add"
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}
