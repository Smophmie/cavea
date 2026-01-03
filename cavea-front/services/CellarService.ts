import { baseURL } from "@/api";

export const cellarService = {
   getTotalStock: async (token: string) => {
    const response = await fetch(`${baseURL}/cellar-items/total-stock`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du stock");
    }

    const data = await response.json();
    return data.total_stock;
  },

  getStockByColour: async (token: string) => {
    const response = await fetch(`${baseURL}/cellar-items/stock-by-colour`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du stock par couleur");
    } 

    const data = await response.json();
    return data;
  },

  getLastAdded: async (token: string) => {
    const response = await fetch(`${baseURL}/cellar-items/last`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des derniers ajouts");
    } 

    const data = await response.json();
    return data;
  }
};