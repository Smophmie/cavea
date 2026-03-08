import { createContext, useContext, useState } from "react";
import { useStorageState } from "./useStorageState";
import { baseURL } from "@/api";

type AuthContextType = {
  token: string | null;
  username: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  loading: boolean;
  storageLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken, storageLoading] = useStorageState("authToken");
  const [username, setUsername] = useStorageState("authUser");
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<string | null> => {
    setLoading(true);

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
        return null;
      } else {
        if (response.status === 403 && data.email_not_verified) {
          return "EMAIL_NOT_VERIFIED";
        }
        return data.message || "Erreur lors de la connexion";
      }
    } catch (err) {
      console.error(err);
      return "Impossible de se connecter au serveur.";
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
      value={{ token, username, login, logout, loading, storageLoading }}
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
