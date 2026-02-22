import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottleWine, Star } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLOUR_MAP } from "@/constants/wineData";

type BottleCardProps = {
  id: number;
  bottleName: string;
  domainName: string;
  region: string;
  quantity: number;
  price?: number;
  color?: string;
  vintage: number;
  rating?: number;
  showRating?: boolean;
};

export default function BottleCard({ 
  id,
  bottleName, 
  domainName, 
  region, 
  quantity, 
  price,
  color,
  vintage,
  rating,
  showRating = false
}: BottleCardProps) {
  const router = useRouter();
  const iconColor = color ? (COLOUR_MAP[color] || COLOUR_MAP["Autre"]) : "#730b1e";

  const handlePress = () => {
    router.push({
      pathname: "/protected/bottle-detail",
      params: { id, bottleName }
    } as any);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="flex-row items-center border border-lightgray rounded-lg p-4 bg-white"
    >
      <View className="items-center mr-4">
        <BottleWine size={32} color={iconColor} />
        <Text className="text-sm text-gray mt-1">x{quantity}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-black">{bottleName} {vintage}</Text>
        <Text className="text-sm text-gray">{domainName}</Text>
        <Text className="text-sm text-gray">{region}</Text>
        
        {showRating && rating && (
          <View className="flex-row items-center mt-1">
            {Array.from({ length: 10 }, (_, index) => {
              const starValue = index + 1;
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
                  size={12}
                  color={fillColor}
                  fill={fillColor}
                />
              );
            })}
            <Text className="text-xs text-gray ml-2">{rating}/10</Text>
          </View>
        )}
      </View>

      {price && (
        <View className="ml-4">
          <Text className="text-base font-semibold text-gray">{price}€</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}