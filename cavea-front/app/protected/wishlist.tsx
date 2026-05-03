import { View, Text, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import PageTitle from "../components/PageTitle";
import WishlistCard from "../components/WishlistCard";
import PrimaryButton from "../components/PrimaryButton";
import OfflineIndicator from "../components/OfflineIndicator";
import { Heart } from "lucide-react-native";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/authentication/AuthContext";
import { wishlistService } from "@/services/WishlistService";

interface WishlistItem {
  id: number;
  bottle: {
    name: string;
    domain: { name: string };
    region: { name: string } | null;
    colour: { id: number; name: string };
  };
  vintage: { year: number } | null;
  appellation: { name: string } | null;
}

export default function WishlistPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await wishlistService.getWishlistItems(token);
      setItems(data);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [token])
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      "Supprimer",
      "Retirer ce vin de votre liste de souhaits ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            try {
              await wishlistService.deleteWishlistItem(token, id);
              setItems((prev) => prev.filter((i) => i.id !== id));
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer cet élément");
            }
          },
        },
      ]
    );
  };

  const handleAddToCellar = (id: number) => {
    router.push({
      pathname: "/protected/add-bottle",
      params: { fromWishlistId: id },
    } as any);
  };

  return (
    <ScrollView
      className="flex-1 bg-app"
      accessibilityRole="scrollbar"
    >
      <OfflineIndicator />

      <View
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Ma liste de souhaits — Les vins qui me font rêver"
        className="w-full bg-wine px-10 py-14"
      >
        <View
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
          className="w-full items-center my-8"
        >
          <Image
            source={require("../../assets/images/logo-fond-rouge.png")}
            style={{ width: "70%", height: 100 }}
            accessibilityElementsHidden={true}
          />
        </View>
        <PageTitle text="Ma liste de souhaits" color="white" />
        <Text className="text-white text-lg mb-8">
          Les vins qui me font rêver !
        </Text>
      </View>

      <View className="px-6 py-6">
        <View
          accessible={true}
          accessibilityRole="none"
          className="mb-4"
        >
          <PrimaryButton
            text="Ajouter un vin"
            onPress={() => router.push("/protected/add-wishlist-item" as any)}
          />
        </View>

        {loading ? (
          <View
            className="items-center py-10"
            accessible={true}
            accessibilityRole="progressbar"
            accessibilityLabel="Chargement de la liste de souhaits"
          >
            <ActivityIndicator size="large" color="#730b1e" />
          </View>
        ) : items.length > 0 ? (
          <View
            accessible={false}
            accessibilityRole="list"
            className="gap-3"
          >
            {items.map((item) => (
              <WishlistCard
                key={item.id}
                id={item.id}
                bottleName={item.bottle.name}
                domainName={item.bottle.domain.name}
                region={item.bottle.region?.name || "Région non spécifiée"}
                colour={item.bottle.colour.name}
                vintage={item.vintage?.year}
                onAddToCellar={handleAddToCellar}
                onDelete={handleDelete}
              />
            ))}
          </View>
        ) : (
          <View
            className="items-center justify-center py-16"
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Votre liste de souhaits est vide. Ajoutez des vins pour garder une trace de ceux qui vous font envie."
          >
            <Heart
              color="#730b1e"
              size={56}
              strokeWidth={1.5}
              accessibilityElementsHidden={true}
            />
            <Text className="text-2xl font-bold text-center mt-6 mb-3">
              Votre liste est vide
            </Text>
            <Text className="text-gray-500 text-center text-base leading-6">
              Gardez une trace des vins qui vous font envie et ne ratez plus jamais
              une belle bouteille.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
