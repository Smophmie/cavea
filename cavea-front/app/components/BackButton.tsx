import React from "react";
import { TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="p-2"
      onPress={() => router.back()}
    >
      <ArrowLeft color="#bb2700" size={28} />
    </TouchableOpacity>
  );
}
