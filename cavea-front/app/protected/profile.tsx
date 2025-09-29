import { View, Text, ScrollView } from "react-native";
import PageTitle from "../components/PageTitle";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "@/authentication/AuthContext";

export default function ProfilePage() {

  const { username } = useAuth();

  return (
    <ScrollView 
      className="flex-1 bg-app px-6"
      contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
    >

      <PageTitle text="Mon compte" color="wine"></PageTitle>
      <LogoutButton></LogoutButton>

    </ScrollView>
  );
}
