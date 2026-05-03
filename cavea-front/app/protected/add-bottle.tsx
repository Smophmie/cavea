import { ScrollView, Alert, ActivityIndicator, View } from "react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/authentication/AuthContext";
import AddOrUpdateBottleForm from "../components/AddOrUpdateBottleForm";
import { cellarService } from "@/services/CellarService";
import { wishlistService } from "@/services/WishlistService";

export default function AddBottlePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { fromWishlistId } = useLocalSearchParams<{ fromWishlistId?: string }>();
  const [formKey, setFormKey] = useState(0);
  const [initialData, setInitialData] = useState<any>(undefined);
  const [initialDataLoading, setInitialDataLoading] = useState(!!fromWishlistId);

  useFocusEffect(
    useCallback(() => {
      if (!fromWishlistId) {
        setFormKey(prev => prev + 1);
      }
    }, [fromWishlistId])
  );

  useEffect(() => {
    if (!fromWishlistId || !token) {
      setInitialDataLoading(false);
      return;
    }

    wishlistService
      .getWishlistItemById(token, Number(fromWishlistId))
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
        console.warn("Could not load wishlist item for pre-fill");
      })
      .finally(() => {
        setInitialDataLoading(false);
      });
  }, [fromWishlistId, token]);

  const handleSubmit = async (formData: any) => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    try {
      await cellarService.createCellarItem(token, formData);

      if (fromWishlistId) {
        try {
          await wishlistService.deleteWishlistItem(token, Number(fromWishlistId));
        } catch {
          console.warn("Could not remove wishlist item after adding to cellar");
        }
      }

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

  if (initialDataLoading) {
    return (
      <View className="flex-1 bg-app items-center justify-center">
        <ActivityIndicator size="large" color="#730b1e" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-app">
      <AddOrUpdateBottleForm
        key={formKey}
        mode="add"
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}
