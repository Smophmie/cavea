import { createContext, useContext } from "react";
import { useStorageState } from "./useStorageState";
import { baseURL } from "@/api";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken, loading] = useStorageState("authToken");

  const login = (newToken: string) => {
    setToken(newToken);
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
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
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
