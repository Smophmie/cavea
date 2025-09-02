import { View, Text } from "react-native";
import PageTitle from "../components/PageTitle";

export default function CellarPage() {
  return (
    <View className="flex-1 items-center justify-center bg-app px-6">
      <PageTitle text="Ma cave en détail" color="wine"></PageTitle>
    </View>
  );
}
