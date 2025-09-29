import { View, Text, ScrollView } from "react-native";
import PageTitle from "../components/PageTitle";

export default function CellarPage() {
  return (
    <ScrollView 
      className="flex-1 bg-app px-6"
      contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
    >

      <PageTitle text="Ma cave en détail" color="wine"></PageTitle>
      
    </ScrollView>
  );
}
