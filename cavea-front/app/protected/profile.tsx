import { View, Text, ScrollView } from "react-native";
import PageTitle from "../components/PageTitle";
import LogoutButton from "../components/LogoutButton";
import SubTitle from "../components/SubTitle";
import { Image } from "expo-image";

export default function ProfilePage() {
  return (
    <ScrollView className="flex-1 bg-app">
      <View className="w-full bg-wine px-10 py-14">
        <View className="w-full items-center my-8">
          <Image
            source={require("../../assets/images/logo-fond-rouge.png")}
            style={{ width: "70%", height: 100 }}
          />
        </View>
        <PageTitle text="Mon compte" color="white" />
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Informations" color="black" />
      </View>
      <View className="p-6">
        <LogoutButton />
      </View>
    </ScrollView>
  );
}
