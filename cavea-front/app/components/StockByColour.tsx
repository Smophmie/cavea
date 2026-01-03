import React from "react";
import { View, Text } from "react-native";

interface StockByColour {
  colour: string;
  stock: number;
}

type StockByColourProps = {
  data: StockByColour[];
  loading: boolean;
};

const colourMap: { [key: string]: string } = {
  "Rouge": "#8B0000",
  "Blanc": "#F5DEB3",
  "Rosé": "#FFB6C1",
  "Pétillant": "#FFD700",
  "Orange": "#FF8C00",
  "Autre": "#808080"
};

export default function StockByColour({ data, loading }: StockByColourProps) {
  if (loading) {
    return <Text className="text-gray-500 mt-2">Chargement...</Text>;
  }

  if (data.length === 0) {
    return <Text className="text-gray-500 mt-2">Aucune bouteille</Text>;
  }

  return (
    <View className="mt-4">
      {data.map((item, index) => (
        <View key={index} className="flex-row items-center mb-2">
          <View 
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: colourMap[item.colour] || colourMap["Autre"] }}
          />
          <Text className="text-base">
            {item.colour}   {item.stock}
          </Text>
        </View>
      ))}
    </View>
  );
}