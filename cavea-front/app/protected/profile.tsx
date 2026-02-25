import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Mail, Trash2, ExternalLink, Scale } from "lucide-react-native";
import PageTitle from "../components/PageTitle";
import SubTitle from "../components/SubTitle";
import LogoutButton from "../components/LogoutButton";
import CardIconText from "../components/CardIconText";
import { useAuth } from "@/authentication/AuthContext";
import { userService, UserProfile } from "@/services/UserService";
import { cellarService, CellarStats } from "@/services/CellarService";

const CONTACT_EMAIL = "sothereau@gmail.com";
const PRIVACY_POLICY_URL = "https://smophmie.github.io/cavea-privacy/";


export default function ProfilePage() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<CellarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [profileData, statsData] = await Promise.all([
        userService.getMe(token),
        cellarService.getStats(token),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.error("Erreur chargement profil :", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [token])
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Toutes vos données seront supprimées définitivement. Êtes-vous sûr ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            setDeleting(true);
            try {
              await userService.deleteAccount(token);
              await logout();
            } catch (error) {
              setDeleting(false);
              Alert.alert("Erreur", "La suppression du compte a échoué. Veuillez réessayer.");
            }
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Linking.openURL(
      `mailto:${CONTACT_EMAIL}?subject=Demande%20de%20données%20personnelles`
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
  };

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
        {!loading && profile && (
          <Text className="text-white text-lg mb-2">
            Bonjour, {profile.firstname} !
          </Text>
        )}
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Mes informations" color="black" />
        {loading ? (
          <Text className="text-gray">Chargement...</Text>
        ) : profile ? (
          <View className="gap-4">
            <View className="flex-row justify-between border-b border-lightgray pb-3">
              <Text className="text-gray text-base">Prénom</Text>
              <Text className="text-black font-semibold text-base">{profile.firstname}</Text>
            </View>
            <View className="flex-row justify-between border-b border-lightgray pb-3">
              <Text className="text-gray text-base">Nom</Text>
              <Text className="text-black font-semibold text-base">{profile.name}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray text-base">Email</Text>
              <Text className="text-black font-semibold text-base">{profile.email}</Text>
            </View>
          </View>
        ) : (
          <Text className="text-gray">Impossible de charger les informations.</Text>
        )}
      </View>

      <View className="border border-lightgray rounded-lg p-6 mx-6 bg-white">
        <SubTitle text="Mes statistiques" color="black" />
        <View className="flex-col flex-wrap gap-1">
          <CardIconText
            label="Bouteilles en cave"
            text={loading ? "..." : `${stats?.total_stock ?? 0}`}
            icon="Wine"
            iconColor="#730b1e"
            textColor="text-wine"
          />
          <CardIconText
            label="Valeur totale de ma cave"
            text={
              loading
                ? "..."
                : stats?.total_value !== null && stats?.total_value !== undefined
                ? `${stats.total_value} €`
                : "—"
            }
            icon="TrendingUp"
            iconColor="#730b1e"
            textColor="text-wine"
          />
          <CardIconText
            label="Ma région préférée"
            text={loading ? "..." : stats?.favourite_region ?? "—"}
            icon="MapPin"
            iconColor="#730b1e"
            textColor="text-wine"
          />
        </View>
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Nous contacter" color="black" />
        <Text className="text-gray text-base mb-6">
          Vous souhaitez obtenir une copie de vos données personnelles ou exercer vos droits ?
          Contactez-nous par email, nous vous répondrons dans les plus brefs délais.
        </Text>
        <TouchableOpacity
          className="flex-row items-center justify-center gap-3 border border-wine rounded-lg px-6 py-3"
          onPress={handleContact}
        >
          <Mail size={18} color="#730b1e" />
          <Text className="text-wine text-base font-semibold">Envoyer un email</Text>
        </TouchableOpacity>
      </View>

      <View className="border border-lightgray rounded-lg p-6 m-6 bg-white">
        <SubTitle text="Informations légales" color="black" />
        <View className="gap-3">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-3 border border-wine rounded-lg px-6 py-3"
            onPress={() => router.push("/protected/legal-mentions")}
          >
            <Scale size={18} color="#730b1e" />
            <Text className="text-wine text-base font-semibold">Mentions légales</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-3 border border-wine rounded-lg px-6 py-3"
            onPress={handlePrivacyPolicy}
          >
            <ExternalLink size={18} color="#730b1e" />
            <Text className="text-wine text-base font-semibold">Politique de confidentialité</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 pb-10 gap-3 mt-2">
        <LogoutButton />
        <TouchableOpacity
          className="flex-row items-center justify-center gap-3 border border-red-600 rounded-lg px-6 py-3 mt-2"
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          <Trash2 size={18} color="#dc2626" />
          <Text className="text-red-600 text-base font-semibold">
            {deleting ? "Suppression..." : "Supprimer mon compte"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
