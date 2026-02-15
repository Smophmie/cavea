import React from "react";
import { TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface BackButtonProps {
  color?: string;
}

export default function BackButton({ color = "#ffffff" }: BackButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="pt-2 pr-2"
    >
      <ArrowLeft color={color} size={28} />
    </TouchableOpacity>
  );
}
