import React from "react";
import { View, Text, ViewStyle } from "react-native";
import * as LucideIcons from "lucide-react-native";

type CardIconTextProps = {
  text: string;
  icon: keyof typeof LucideIcons;
  label?: string;
  iconColor?: string;
  textColor?: string;
  backgroundColor?: string;
  style?: ViewStyle;
};

export default function CardIconText({ text, icon, label, iconColor, textColor, backgroundColor, style }: CardIconTextProps) {
  const IconComponent = LucideIcons[icon] as React.ComponentType<{ size?: number; color?: string }>;

  return (
    <View
      className="flex-col items-center gap-2 border border-lightgray rounded-lg px-4 py-3 w-48"
      style={{ backgroundColor: backgroundColor || "#ffffff", ...style }}
      >
      {IconComponent && <IconComponent size={40} color={iconColor || "#730b1e"} />}
      {label && <Text className="text-sm text-gray text-center">{label}</Text>}
      <Text className={`text-xl ${textColor || "text-gray"} text-center font-semibold`}>{text}</Text>
    </View>
  );
}
