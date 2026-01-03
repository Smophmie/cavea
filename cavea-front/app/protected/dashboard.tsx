import { View, Text, Image, ScrollView } from "react-native";
import PageTitle from "../components/PageTitle";
import { useAuth } from "@/authentication/AuthContext";
import SubTitle from "../components/SubTitle";
import CardIconText from "../components/CardIconText";
import { useState, useEffect } from "react";
import { cellarService } from "@/services/CellarService";
import BottleCard from "../components/BottleCard";
import StockByColour from "../components/StockByColour";

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
    domain: string;
    PDO: string | null;
    region: string | null;
    colour: {
      name: string;
    };
  };
}

export default function DashboardPage() {

  const { username, token } = useAuth();
  const [totalStock, setTotalStock] = useState<number>(0);
  const [stockByColour, setStockByColour] = useState<StockByColour[]>([]);
  const [lastAdded, setLastAdded] = useState<LastAddedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
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
      }
    };

    fetchData();
  }, [token]);

  return (
    <ScrollView className="flex-1 bg-app">
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
          Bonjour {username ?? "invité"} !
        </Text>

        <View className="flex-row justify-between">
          <CardIconText 
            text={loading ? "..." : `${totalStock} bouteilles`} 
            icon="BottleWine"
            iconColor="#ffffff"
            textColor="text-white"
            backgroundColor="rgba(255, 255, 255, 0.1)"
          />
          {/* <CardIconText text="12 alertes de garde" icon="CircleAlert"></CardIconText> */}
        </View>
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Répartition par couleur" color="black" />
        <StockByColour data={stockByColour} loading={loading} />
      </View>

      {/* <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Alertes de garde" />
      </View> */}

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Vos derniers ajouts" color="black" />
        {loading ? (
          <Text className="text-gray-500 mt-2">Chargement...</Text>
        ) : lastAdded.length > 0 ? (
          <View className="mt-4 gap-3">
            {lastAdded.map((item) => (
              <BottleCard
                key={item.id}
                bottleName={item.bottle.name}
                domainName={item.bottle.domain}
                region={item.bottle.region || "Région non spécifié"}
                quantity={item.stock}
                price={item.price}
                color={item.bottle.colour.name}
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
