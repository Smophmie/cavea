import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from "react-native";
import PageTitle from "../components/PageTitle";
import BottleCard from "../components/BottleCard";
import { useState, useCallback } from "react";
import { useAuth } from "@/authentication/AuthContext";
import { cellarService } from "@/services/CellarService";
import OfflineIndicator from "../components/OfflineIndicator";
import { useFocusEffect } from "expo-router";
import { COLOUR_MAP } from "@/constants/wineData";

interface CellarItem {
  id: number;
  stock: number;
  price?: number;
  rating?: number;
  bottle: {
    name: string;
    domain: {
      name: string;
    };
    region: {
      name: string;
    } | null;
    colour: {
      id: number;
      name: string;
    };
  };
  vintage: {
    year: number;
  };
  appellation: {
    name: string;
  } | null;
}

const colours = [
  { id: null, name: "Toutes" },
  { id: 1, name: "Rouge" },
  { id: 2, name: "Blanc" },
  { id: 3, name: "Rosé" },
  { id: 4, name: "Pétillant" },
  { id: 5, name: "Orange" },
  { id: 6, name: "Autre" }
];

export default function CellarPage() {
  const { token } = useAuth();
  const [cellarItems, setCellarItems] = useState<CellarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColour, setSelectedColour] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCellarItems = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const items = selectedColour
        ? await cellarService.getCellarItemsByColour(token, selectedColour)
        : await cellarService.getAllCellarItems(token);
      setCellarItems(items);
    } catch (error) {
      console.error("Error loading cellar items:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCellarItems();
    }, [token, selectedColour])
  );

  const query = searchQuery.trim().toLowerCase();
  const displayedItems = query
    ? cellarItems.filter((item) => {
        return (
          item.bottle.name.toLowerCase().includes(query) ||
          item.bottle.domain.name.toLowerCase().includes(query) ||
          (item.bottle.region?.name ?? "").toLowerCase().includes(query) ||
          (item.appellation?.name ?? "").toLowerCase().includes(query)
        );
      })
    : cellarItems;

  return (
    <ScrollView className="flex-1 bg-app">
      <OfflineIndicator />
      <View className="w-full flex-3 bg-wine px-10 py-14">
        <View className="w-full items-center my-8">
          <Image
            source={require("../../assets/images/logo-fond-rouge.png")}
            style={{ width: "70%", height: 100 }}
          />
        </View>
        <PageTitle text="Ma cave en détail" color="white" />
        <Text className="text-white text-lg mb-8">
          Toutes mes bouteilles
        </Text>
        <View className="py-4">
          <Text className="text-white text-lg mb-3">Filtrer par couleur</Text>
          <View className="flex-row flex-wrap gap-2">
            {colours.map((colour) => (
                <TouchableOpacity
                  key={colour.id || "all"}
                  onPress={() => setSelectedColour(colour.id)}
                  style={{ backgroundColor: selectedColour === colour.id ? "rgba(255, 255, 255, 0.1)" : undefined }}
                  className={`px-4 py-2 rounded-lg border flex-row items-center gap-2 ${
                    selectedColour === colour.id
                      ? "border-white"
                      : "bg-wine border-lightgray"
                  }`}
                >
                  {!!COLOUR_MAP[colour.name] && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLOUR_MAP[colour.name] }} />
                  )}
                  <Text className={selectedColour === colour.id ? "font-bold text-white" : "text-white"}>
                    {colour.name}
                  </Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="mt-2 mb-4">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un vin, domaine, région…"
            placeholderTextColor="rgba(255,255,255,0.5)"
            className="border border-lightgray rounded-lg px-4 py-3 text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            clearButtonMode="while-editing"
            testID="search-input"
          />
        </View>
      </View>

      <View className="px-6 py-6">
        {loading ? (
          <Text className="text-gray-500 text-center mt-4">Chargement...</Text>
        ) : displayedItems.length > 0 ? (
          <View className="gap-3">
            {displayedItems.map((item) => (
              <BottleCard
                key={item.id}
                id={item.id}
                bottleName={item.bottle.name}
                domainName={item.bottle.domain.name}
                region={item.bottle.region?.name || "Région non spécifiée"}
                quantity={item.stock}
                price={item.price}
                color={item.bottle.colour.name}
                vintage={item.vintage.year}
                rating={item.rating}
                showRating={true}
              />
            ))}
          </View>
        ) : (
          <Text className="text-gray-500 text-center mt-4">Aucune bouteille trouvée</Text>
        )}
      </View>
    </ScrollView>
  );
}