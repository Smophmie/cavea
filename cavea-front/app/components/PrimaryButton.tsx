import React from "react";
import { TouchableOpacity, Text } from "react-native";

type PrimaryButtonProps = {
  text: string;
  onPress: () => void;
};

export default function PrimaryButton({
  text,
  onPress,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-wine rounded-lg px-6 py-3 w-full my-2`}
      onPress={onPress}
    >
      <Text
        className={`text-white text-center text-lg font-semibold`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
