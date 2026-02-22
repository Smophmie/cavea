import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Wine, MapPin, Calendar, Euro, Package, Pencil, Trash2, Star } from "lucide-react-native";
import { useState, useCallback } from "react";
import { useAuth } from "@/authentication/AuthContext";
import { cellarService } from "@/services/CellarService";
import BackButton from "../components/BackButton";

interface BottleDetail {
  id: number;
  stock: number;
  price?: number;
  rating?: number;
  shop?: string;
  offered_by?: string;
  drinking_window_start?: number;
  drinking_window_end?: number;
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
    grape_varieties?: Array<{
      id: number;
      name: string;
    }>;
  };
  vintage: {
    year: number;
  };
  appellation: {
    name: string;
  } | null;
  comments?: Array<{
    id: number;
    content: string;
    date: string;
  }>;
}

export default function BottleDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [bottleData, setBottleData] = useState<BottleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBottleData = async () => {
    if (!token || !id) return;

    setLoading(true);
    try {
      const data = await cellarService.getCellarItemById(token, Number(id));
      setBottleData(data);
    } catch (error) {
      console.error('Error fetching bottle data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBottleData();
    }, [token, id])
  );

  const handleEdit = () => {
    router.push({
      pathname: "/protected/update-bottle",
      params: { id }
    } as any);
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer la bouteille",
      "Êtes-vous sûr de vouloir supprimer cette bouteille ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (!token || !id) return;
            try {
              await cellarService.deleteCellarItem(token, Number(id));
              Alert.alert("Succès", "Bouteille supprimée", [
                {
                  text: "OK",
                  onPress: () => router.replace("/protected/dashboard")
                }
              ]);
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer la bouteille");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-app items-center justify-center">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    );
  }

  if (!bottleData) {
    return (
      <View className="flex-1 bg-app items-center justify-center">
        <Text className="text-gray-500">Bouteille non trouvée</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-app">
      <View className="w-full bg-wine px-10 py-14">
        <View className="flex-row justify-between items-center mb-8">
          <BackButton color="#ffffff" />

          <View className="flex-row">
            <TouchableOpacity onPress={handleEdit} className="p-2">
              <Pencil size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Trash2 size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-start gap-4">
          <View>
            <Wine size={65} color="#ffffff" />
          </View>

          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-2">
              {bottleData.bottle.name}
            </Text>
            <Text className="text-white text-lg">
              {bottleData.vintage.year}
            </Text>
            <Text className="text-white text-base mt-1">
              {bottleData.bottle.domain.name}
            </Text>
          </View>
        </View>
      </View>

      <View className="mx-6 mt-6 bg-white rounded-lg border border-lightgray p-6">
        <View className="flex-row flex-wrap">
          <View className="w-1/2 mb-6">
            <View className="flex-row items-center mb-2">
              <MapPin size={20} color="#730b1e" />
              <Text className="text-gray-500 text-sm ml-2">Région</Text>
            </View>
            <Text className="text-black text-base">
              {bottleData.bottle.region?.name || "Non spécifiée"}
            </Text>
          </View>

          <View className="w-1/2 mb-6">
            <View className="flex-row items-center mb-2">
              <Calendar size={20} color="#730b1e" />
              <Text className="text-gray-500 text-sm ml-2">Millésime</Text>
            </View>
            <Text className="text-black text-base">
              {bottleData.vintage.year}
            </Text>
          </View>

          {bottleData.price && (
            <View className="w-1/2 mb-6">
              <View className="flex-row items-center mb-2">
                <Euro size={20} color="#730b1e" />
                <Text className="text-gray-500 text-sm ml-2">Prix</Text>
              </View>
              <Text className="text-black text-base">
                {bottleData.price}€
              </Text>
            </View>
          )}

          <View className="w-1/2 mb-6">
            <View className="flex-row items-center mb-2">
              <Package size={20} color="#730b1e" />
              <Text className="text-gray-500 text-sm ml-2">Quantité</Text>
            </View>
            <Text className="text-black text-base">
              x{bottleData.stock}
            </Text>
          </View>
        </View>
      </View>

      <View className="mx-6 mt-6 bg-white rounded-lg border border-lightgray p-6">
        <Text className="text-xl font-bold text-black mb-4">Détails</Text>

        <View className="mb-4">
          <Text className="text-gray-500 text-sm mb-1">Appellation</Text>
          <Text className="text-black text-base">
            {bottleData.appellation?.name || "Non spécifiée"}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-500 text-sm mb-1">Cépages</Text>
          <Text className="text-black text-base">
            {bottleData.bottle.grape_varieties && bottleData.bottle.grape_varieties.length > 0
              ? bottleData.bottle.grape_varieties.map(gv => gv.name).join(', ')
              : "Non spécifiés"}
          </Text>
        </View>

        {bottleData.shop && (
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Lieu d'achat</Text>
            <Text className="text-black text-base">{bottleData.shop}</Text>
          </View>
        )}

        {bottleData.offered_by && (
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Offert par</Text>
            <Text className="text-black text-base">{bottleData.offered_by}</Text>
          </View>
        )}

        {(bottleData.drinking_window_start || bottleData.drinking_window_end) && (
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Période de garde</Text>
            <Text className="text-black text-base">
              {bottleData.drinking_window_start || '?'} - {bottleData.drinking_window_end || '?'}
            </Text>
          </View>
        )}
      </View>

      {(bottleData.rating || (bottleData.comments && bottleData.comments.length > 0)) && (
        <View className="mx-6 mt-6 bg-white rounded-lg border border-lightgray p-6">
          <Text className="text-xl font-bold text-black mb-4">Mes notes personnelles</Text>

          {bottleData.rating && (
            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-2">Ma note</Text>
              <View className="flex-row items-center">
                {Array.from({ length: 10 }, (_, index) => {
                  const starValue = index + 1;
                  const rating = parseFloat(String(bottleData.rating));
                  const isFilled = rating >= starValue;
                  const isHalfFilled = !isFilled && rating >= starValue - 0.5;

                  let fillColor = "transparent";
                  if (isFilled) {
                    fillColor = "#f59e0b";
                  } else if (isHalfFilled) {
                    fillColor = "rgba(245, 158, 11, 0.5)";
                  }

                  return (
                    <Star
                      key={index}
                      size={20}
                      color={fillColor === "transparent" ? "#f59e0b" : fillColor}
                      fill={fillColor}
                    />
                  );
                })}
                <Text className="text-black text-base ml-2">{bottleData.rating}/10</Text>
              </View>
            </View>
          )}

          {bottleData.comments && bottleData.comments.length > 0 && (
            <View>
              <Text className="text-gray-500 text-sm mb-2">Commentaires</Text>
              {bottleData.comments.map((comment: any, index: number) => (
                <View key={comment.id || index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <Text className="text-black text-base">{comment.content}</Text>
                  {comment.date && (
                    <Text className="text-gray-400 text-xs mt-1">
                      {new Date(comment.date).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}