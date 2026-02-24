import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import { ExternalLink } from "lucide-react-native";
import PageTitle from "../components/PageTitle";
import SubTitle from "../components/SubTitle";
import BackButton from "../components/BackButton";

const PRIVACY_POLICY_URL = "https://smophmie.github.io/cavea-privacy/";

export default function LegalMentionsPage() {
  return (
    <ScrollView className="flex-1 bg-app">
      <View className="w-full bg-wine px-10 py-14">
        <BackButton color="#ffffff" />
        <View className="w-full items-center my-8">
          <Image
            source={require("../../assets/images/logo-fond-rouge.png")}
            style={{ width: "70%", height: 100 }}
          />
        </View>
        <PageTitle text="Mentions légales" color="white" />
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Éditeur de l'application" color="black" />
        <View className="gap-4">
          <View className="flex-row justify-between border-b border-lightgray pb-3">
            <Text className="text-gray text-base">Application</Text>
            <Text className="text-black font-semibold text-base">Cavea</Text>
          </View>
          <View className="flex-row justify-between border-b border-lightgray pb-3">
            <Text className="text-gray text-base">Éditeur</Text>
            <Text className="text-black font-semibold text-base">Sophie Théréau</Text>
          </View>
          <View className="flex-row justify-between border-b border-lightgray pb-3">
            <Text className="text-gray text-base">Qualité</Text>
            <Text className="text-black font-semibold text-base">Développeuse indépendante</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray text-base">Contact</Text>
            <Text className="text-black font-semibold text-base">sothereau@gmail.com</Text>
          </View>
        </View>
      </View>

      {/* Propriété intellectuelle */}
      <View className="border border-lightgray rounded-lg p-6 mx-6 bg-white">
        <SubTitle text="Propriété intellectuelle" color="black" />
        <Text className="text-gray text-base leading-6">
          L'application Cavea, son contenu (logo, design, textes) et son code source sont la propriété exclusive de Sophie Théréau. Toute reproduction, distribution ou utilisation sans autorisation préalable est strictement interdite.
        </Text>
      </View>

      {/* Données personnelles */}
      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Données personnelles" color="black" />
        <Text className="text-gray text-base leading-6 mb-4">
          Les données collectées (nom, prénom, adresse email, données de cave) sont utilisées uniquement dans le cadre du fonctionnement de l'application. Elles ne sont ni vendues, ni cédées à des tiers à des fins commerciales.
        </Text>
        <Text className="text-gray text-base leading-6 mb-6">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à l'adresse sothereau@gmail.com.
        </Text>
        <TouchableOpacity
          className="flex-row items-center justify-center gap-3 border border-wine rounded-lg px-6 py-3"
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <ExternalLink size={18} color="#730b1e" />
          <Text className="text-wine text-base font-semibold">Politique de confidentialité</Text>
        </TouchableOpacity>
      </View>

      {/* Responsabilité */}
      <View className="border border-lightgray rounded-lg p-6 mx-6 bg-white">
        <SubTitle text="Limitation de responsabilité" color="black" />
        <Text className="text-gray text-base leading-6">
          L'éditeur s'efforce d'assurer la disponibilité et la fiabilité de l'application. Toutefois, il ne saurait être tenu responsable des interruptions de service, pertes de données ou dommages indirects liés à l'utilisation de l'application.
        </Text>
      </View>

      {/* Droit applicable */}
      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Droit applicable" color="black" />
        <Text className="text-gray text-base leading-6">
          Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
        </Text>
      </View>
    </ScrollView>
  );
}
