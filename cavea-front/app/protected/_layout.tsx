import { Tabs } from "expo-router";
import { Home, Wine, UserRound, PlusCircle } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#bb2700",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "",
          headerShown:false,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="cellar"
        options={{
          title: "",
          headerShown:false,
          tabBarIcon: ({ color, size }) => <Wine color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="add-bottle"
        options={{
          title: "",
          headerShown:false,
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          headerShown:false,
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
        }}
      />
    
    </Tabs>
  );
}
