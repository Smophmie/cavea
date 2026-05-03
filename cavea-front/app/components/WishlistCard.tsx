import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottleWine, Trash2, ShoppingBag } from "lucide-react-native";
import { COLOUR_MAP } from "@/constants/wineData";

type WishlistCardProps = {
  id: number;
  bottleName: string;
  domainName: string;
  region: string;
  colour: string;
  vintage?: number | null;
  onAddToCellar: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function WishlistCard({
  id,
  bottleName,
  domainName,
  region,
  colour,
  vintage,
  onAddToCellar,
  onDelete,
}: WishlistCardProps) {
  const iconColor = COLOUR_MAP[colour] || COLOUR_MAP["Autre"];
  const vintageLabel = vintage ? ` ${vintage}` : '';
  const fullName = `${bottleName}${vintageLabel}`;

  return (
    <View
      accessible={false}
      className="border border-lightgray rounded-lg p-4 bg-white"
    >
      <View
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`${fullName}, ${domainName}, ${region}, ${colour}`}
        className="flex-row items-center mb-3"
      >
        <View className="items-center mr-4" accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
          <BottleWine size={32} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-black">
            {bottleName}{vintage ? ` ${vintage}` : ''}
          </Text>
          <Text className="text-sm text-gray">{domainName}</Text>
          <Text className="text-sm text-gray">{region}</Text>
          <Text className="text-xs text-gray mt-1">{colour}</Text>
        </View>
      </View>

      <View className="flex-row gap-3 mt-1">
        <TouchableOpacity
          onPress={() => onAddToCellar(id)}
          testID={`add-to-cellar-${id}`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Ajouter ${fullName} à ma cave`}
          accessibilityHint="Ouvre le formulaire d'ajout pré-rempli avec les informations de ce vin"
          className="flex-1 flex-row items-center justify-center gap-2 bg-wine py-2 rounded-lg"
        >
          <ShoppingBag size={16} color="#ffffff" accessibilityElementsHidden={true} />
          <Text className="text-white text-sm font-semibold">Ajouter à ma cave</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(id)}
          testID={`delete-wishlist-${id}`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Supprimer ${fullName} de la liste de souhaits`}
          accessibilityHint="Retire ce vin de votre liste de souhaits"
          className="flex-row items-center justify-center px-4 py-2 border border-lightgray rounded-lg"
        >
          <Trash2 size={16} color="#730b1e" accessibilityElementsHidden={true} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
