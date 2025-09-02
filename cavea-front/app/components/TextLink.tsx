import React from "react";
import { Pressable, Text } from "react-native";

type TextLinkProps = {
  text: string;
  onPress: () => void;
  className?: string;
};

export default function TextLink({ text, onPress, className }: TextLinkProps) {
  return (
    <Pressable onPress={onPress}>
      {({ hovered }) => (
        <Text
          className={`text-wine ${hovered ? "underline" : ""} ${className ?? ""}`}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
}
