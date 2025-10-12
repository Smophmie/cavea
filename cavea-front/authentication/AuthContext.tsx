import { createContext, useContext, useState } from "react";
import { useStorageState } from "./useStorageState";
import { baseURL } from "@/api";

type AuthContextType = {
  token: string | null;
  username: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken, storageLoading] = useStorageState("authToken");
  const [username, setUsername] = useStorageState("authUser");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUsername(data.user.firstname);
      } else {
        setError(data.message || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Impossible de se connecter au serveur.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    try {
      if (token) {
        await fetch(`${baseURL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    } finally {
      setToken(null);
      setUsername(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, username, login, logout, loading: storageLoading || loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
