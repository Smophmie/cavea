import React from "react";
import { View, Text } from "react-native";
import * as LucideIcons from "lucide-react-native";

type CardIconTextProps = {
  text: string;
  icon: keyof typeof LucideIcons;
};

export default function CardIconText({ text, icon }: CardIconTextProps) {
  const IconComponent = LucideIcons[icon] as React.ComponentType<{ size?: number; color?: string }>;

  return (
    <View className="flex-col items-center gap-2 border border-lightgray rounded-lg px-4 py-3 bg-white w-48 h-38">
      {IconComponent && <IconComponent size={40} color="#bb2700" />}
      <Text className="text-xl text-gray text-center">{text}</Text>
    </View>
  );
}
