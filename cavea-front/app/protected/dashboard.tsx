import { View, Text, Image, ScrollView } from "react-native";
import PageTitle from "../components/PageTitle";
import { useAuth } from "@/authentication/AuthContext";
import SubTitle from "../components/SubTitle";
import CardIconText from "../components/CardIconText";

export default function DashboardPage() {

  const { username } = useAuth();

  return (
    <ScrollView className="flex-1 bg-app">
      <View className="w-full flex-3 bg-wine px-10 py-14">
        
        <View className="w-full items-center my-8">
          <Image
            source={require("../../assets/images/cavea-white-logo.png")}
            style={{ width: "70%", height: 100 }}
            resizeMode="contain"            
          />
        </View>

        <PageTitle text="Ma cave" color="white" />
        <Text className="text-white text-lg mb-8">
          Bonjour {username ?? "invité"} !
        </Text>

        <View className="flex-row justify-between">
          <CardIconText text="156 bouteilles" icon="Wine"></CardIconText>
          <CardIconText text="12 alertes de garde" icon="CircleAlert"></CardIconText>
        </View>
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Répartition par couleur" />
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Alertes de garde" />
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Vos derniers ajouts" />
      </View>
    </ScrollView>
  );
}
