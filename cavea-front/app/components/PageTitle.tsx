import React from "react";
import { Text } from "react-native";

type PageTitleProps = {
  text: string;
  color?: "wine" | "white";
};

export default function PageTitle({ text, color = "white" }: PageTitleProps) {

  return (
      <Text className={`text-4xl font-playfairbold mb-4 text-${color}`}>{text}</Text>
  );
}
