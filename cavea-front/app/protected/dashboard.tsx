import { View, Text } from "react-native";
import PageTitle from "../components/PageTitle";
import LogoutButton from "../components/LogoutButton";

export default function DashboardPage() {
  return (
    <View className="flex-1 items-center justify-center bg-app px-6">
      <PageTitle text="Ma cave" color="wine"></PageTitle>
      <LogoutButton></LogoutButton>
    </View>
  );
}
