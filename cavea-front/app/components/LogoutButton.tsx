import { Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../authentication/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <TouchableOpacity
      className="bg-wine px-6 py-3 rounded-lg mt-4"
      onPress={logout}
    >
      <Text className="text-white text-lg text-center">Déconnexion</Text>
    </TouchableOpacity>
  );
}