import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { api } from "../api";

export default function Users() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/1");
        setUser(response.data);
      } catch (error) {
        console.error("Erreur API:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <View>
      {user ? <Text>{user.name}</Text> : <Text>Chargement...</Text>}
    </View>
  );
}
