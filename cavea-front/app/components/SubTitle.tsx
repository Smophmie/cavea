import React from "react";
import { Text } from "react-native";

type SubTitleProps = {
  text: string;
  color?: "wine" | "white" | "gray";
};

export default function SubTitle({ text, color = "gray" }: SubTitleProps) {

  return (
      <Text className={`text-2xl font-playfairbold mb-8 text-${color}`}>{text}</Text>
  );
}
