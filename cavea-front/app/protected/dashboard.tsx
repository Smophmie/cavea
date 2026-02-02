import { View, Text, Image, ScrollView } from "react-native";
import PageTitle from "../components/PageTitle";
import { useAuth } from "@/authentication/AuthContext";
import SubTitle from "../components/SubTitle";
import CardIconText from "../components/CardIconText";
import { useState, useEffect, useCallback } from "react";
import { cellarService } from "@/services/CellarService";
import BottleCard from "../components/BottleCard";
import StockByColour from "../components/StockByColour";
import OfflineIndicator from "../components/OfflineIndicator";
import { useFocusEffect } from "expo-router";

interface StockByColour {
  colour: string;
  stock: number;
}

interface LastAddedItem {
  id: number;
  stock: number;
  price?: number;
  bottle: {
    name: string;
    domain: {
      name: string;
    };
    region: {
      name: string;
    } | null;
    colour: {
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

export default function DashboardPage() {

  const { token } = useAuth();
  const [totalStock, setTotalStock] = useState<number>(0);
  const [stockByColour, setStockByColour] = useState<StockByColour[]>([]);
  const [lastAdded, setLastAdded] = useState<LastAddedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const [stock, stockColour, lastAdded] = await Promise.all([
        cellarService.getTotalStock(token),
        cellarService.getStockByColour(token),
        cellarService.getLastAdded(token)
      ]);
      setTotalStock(stock);
      setStockByColour(stockColour);
      setLastAdded(lastAdded);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      fetchData(true);
    }, [token])
  );


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

        <PageTitle text="Ma cave" color="white" />
        <Text className="text-white text-lg mb-8">
          En un coup d'œil !
        </Text>

        <View className="flex-row justify-between">
          <CardIconText 
            text={loading ? "..." : `${totalStock} bouteilles`} 
            icon="BottleWine"
            iconColor="#ffffff"
            textColor="text-white"
            backgroundColor="rgba(255, 255, 255, 0.1)"
          />
        </View>
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Répartition par couleur" color="black" />
        <StockByColour data={stockByColour} loading={loading} />
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Mes derniers ajouts" color="black" />
        {loading ? (
          <Text className="text-gray-500 mt-2">Chargement...</Text>
        ) : lastAdded.length > 0 ? (
          <View className="mt-4 gap-3">
            {lastAdded.map((item) => (
              <BottleCard
                key={item.id}
                bottleName={item.bottle.name}
                domainName={item.bottle.domain.name}
                region={item.bottle.region?.name || "Région non spécifiée"}
                quantity={item.stock}
                price={item.price}
                color={item.bottle.colour.name}
                vintage={item.vintage.year}
              />
            ))}
          </View>
        ) : (
          <Text className="text-gray-500 mt-2">Aucun ajout récent</Text>
        )}
      </View>
    </ScrollView>
  );
}