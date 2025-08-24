import React from "react";
import { TouchableOpacity, Text } from "react-native";

type SecondaryButtonProps = {
  text: string;
  onPress: () => void;
};

export default function SecondaryButton({
  text,
  onPress,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-white rounded-lg border border-wine border-solid px-6 py-3 my-2 w-full`}
      onPress={onPress}
    >
      <Text
        className={`text-wine text-center text-lg`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
