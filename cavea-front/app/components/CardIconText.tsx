import React from "react";
import { View, Text } from "react-native";
import * as LucideIcons from "lucide-react-native";

type CardIconTextProps = {
  text: string;
  icon: keyof typeof LucideIcons;
  iconColor?: string;
  textColor?: string;
  backgroundColor?: string;
};

export default function CardIconText({ text, icon, iconColor, textColor, backgroundColor }: CardIconTextProps) {
  const IconComponent = LucideIcons[icon] as React.ComponentType<{ size?: number; color?: string }>;

  return (
    <View 
      className="flex-col items-center gap-2 border border-lightgray rounded-lg px-4 py-3 w-48 h-38"
      style={{ backgroundColor: backgroundColor || "#ffffff" }}
      >
      {IconComponent && <IconComponent size={40} color={iconColor || "#bb2700"} />}
      <Text className={`text-xl ${textColor || "text-gray"} text-center`}>{text}</Text>
    </View>
  );
}
