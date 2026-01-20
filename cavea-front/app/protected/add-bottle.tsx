import { View, Text, Image, ScrollView } from "react-native";
import PageTitle from "../components/PageTitle";
import OfflineIndicator from "../components/OfflineIndicator";
import AddOrUpdateBottleForm from "../components/AddOrUpdateBottleForm";

export default function AddBottlePage() {

  return (
    <ScrollView className="flex-1 bg-app">
      <OfflineIndicator />
      <View className="w-full flex-3 bg-wine px-10 py-14">
        
        <View className="w-full items-center my-8">
          <Image
            source={require("../../assets/images/cavea-white-logo.png")}
            style={{ width: "70%", height: 100 }}
            resizeMode="contain"            
          />
        </View>

        <PageTitle text="Ajouter une bouteille" color="white" />
      </View>
      <AddOrUpdateBottleForm />
    </ScrollView>
  );
}
