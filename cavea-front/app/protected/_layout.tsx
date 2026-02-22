import { Tabs } from "expo-router";
import { Home, Wine, UserRound, PlusCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

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
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
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
    </Tabs>
  );
}