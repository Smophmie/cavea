import { View, Text, Image } from "react-native";
import PageTitle from "../components/PageTitle";
import { Heart } from "lucide-react-native";

export default function WishlistPage() {
  return (
    <View className="flex-1 bg-app">
      <View className="w-full bg-wine px-10 py-14">
        <View className="w-full items-center my-8">
          <Image
            source={require("../../assets/images/logo-fond-rouge.png")}
            style={{ width: "70%", height: 100 }}
          />
        </View>
        <PageTitle text="Ma liste de souhaits" color="white" />
        <Text className="text-white text-lg mb-8">
          Les vins qui me font rêver !
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-10">
        <Heart color="#730b1e" size={56} strokeWidth={1.5} />
        <Text className="text-2xl font-bold text-center mt-6 mb-3">
          Bientôt disponible
        </Text>
        <Text className="text-gray-500 text-center text-base leading-6">
          Gardez une trace des vins qui vous font envie et ne ratez plus jamais
          une belle bouteille.
        </Text>
      </View>
    </View>
  );
}
