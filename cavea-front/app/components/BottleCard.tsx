import React from "react";
import { View, Text } from "react-native";
import { BottleWine } from "lucide-react-native";

type BottleCardProps = {
  bottleName: string;
  domainName: string;
  region: string;
  quantity: number;
  price?: number;
  color?: string;
};

const colourMap: { [key: string]: string } = {
  "Rouge": "#8B0000",
  "Blanc": "#F5DEB3",
  "Rosé": "#FFB6C1",
  "Pétillant": "#FFD700",
  "Orange": "#FF8C00",
  "Autre": "#808080"
};

export default function BottleCard({ 
  bottleName, 
  domainName, 
  region, 
  quantity, 
  price,
  color
}: BottleCardProps) {
  const iconColor = color ? (colourMap[color] || colourMap["Autre"]) : "#bb2700";

  return (
    <View className="flex-row items-center border border-lightgray rounded-lg p-4 bg-white">
      <View className="items-center mr-4">
        <BottleWine size={32} color={iconColor} />
        <Text className="text-sm text-gray mt-1">x{quantity}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-black">{bottleName}</Text>
        <Text className="text-sm text-gray">{domainName}</Text>
        <Text className="text-sm text-gray">{region}</Text>
      </View>

      {price && (
        <View className="ml-4">
          <Text className="text-base font-semibold text-gray">{price}€</Text>
        </View>
      )}
    </View>
  );
}