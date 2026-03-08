import { Tabs, Redirect } from "expo-router";
import { Home, Wine, UserRound, Plus } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/AuthContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  if (!token) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#730b1e",
        tabBarInactiveTintColor: "#6B7280",
        // Respect bottom safe area (home indicator on iPhone, nav bar on Android)
        tabBarStyle: { paddingBottom: insets.bottom > 0 ? insets.bottom : 8, paddingTop: 4, },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="cellar"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <Wine color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="add-bottle"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                backgroundColor: "#730b1e",
                borderRadius: 32,
                width: 56,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 6,
              }}
            >
              <Plus color="white" size={28} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="bottle-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="update-bottle"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="legal-mentions"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}