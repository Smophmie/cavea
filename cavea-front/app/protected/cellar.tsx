import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import PageTitle from "../components/PageTitle";
import BottleCard from "../components/BottleCard";
import { useState, useEffect } from "react";
import { useAuth } from "@/authentication/AuthContext";
import { cellarService } from "@/services/CellarService";
import OfflineIndicator from "../components/OfflineIndicator";

interface CellarItem {
  id: number;
  stock: number;
  price?: number;
  bottle: {
    name: string;
    domain: string;
    PDO: string | null;
    region: string | null;
    colour: {
      id: number;
      name: string;
    };
  };
  vintage: {
    year: string;
  };
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

  useEffect(() => {
    if (!token) return;
    fetchCellarItems();
  }, [token, selectedColour]);

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

  return (
    <ScrollView className="flex-1 bg-app">
      <OfflineIndicator />
      <View className="w-full flex-3 bg-wine px-10 py-14">
        <View className="w-full items-center my-8">
          <Image
            source={require("../../assets/images/cavea-white-logo.png")}
            style={{ width: "70%", height: 100 }}
            resizeMode="contain"            
          />
        </View>
        <PageTitle text="Ma cave en détail" color="white" />
        <Text className="text-white text-lg mb-8">
          Toutes mes bouteilles
        </Text>
        <View className="py-4">
          <Text className="text-white text-lg mb-3">Filtrer par couleur</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {colours.map((colour) => (
                <TouchableOpacity
                  key={colour.id || "all"}
                  onPress={() => setSelectedColour(colour.id)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedColour === colour.id 
                      ? "bg-darkwine border-darkwine"
                      : "bg-wine border-lightgray"
                  }`}
                >
                  <Text className={selectedColour === colour.id ? "font-bold text-white" : "text-white"}>
                    {colour.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View className="px-6 py-6">
        {loading ? (
          <Text className="text-gray-500 text-center mt-4">Chargement...</Text>
        ) : cellarItems.length > 0 ? (
          <View className="gap-3">
            {cellarItems.map((item) => (
              <BottleCard
                key={item.id}
                bottleName={item.bottle.name}
                domainName={item.bottle.domain}
                region={item.bottle.region || "Région non spécifiée"}
                quantity={item.stock}
                price={item.price}
                color={item.bottle.colour.name}
                vintage={parseInt(item.vintage.year)}
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