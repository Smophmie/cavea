import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ChevronDown, Star } from "lucide-react-native";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import PageTitle from "./PageTitle";

interface BottleFormData {
  bottle: {
    name: string;
    domain: string;
    PDO: string;
    colour_id: number | null;
  };
  vintage: {
    year: string;
  };
  stock: string;
  rating: string;
  price: string;
  shop: string;
  offered_by: string;
  drinking_window_start: string;
  drinking_window_end: string;
}

interface AddOrUpdateFormProps {
  mode: 'add' | 'update';
  initialData?: Partial<BottleFormData>;
  onSubmit: (data: BottleFormData) => Promise<void>;
  onCancel?: () => void;
}

const COLOURS = [
  { id: 1, name: "Rouge" },
  { id: 2, name: "Blanc" },
  { id: 3, name: "Rosé" },
  { id: 4, name: "Pétillant" },
  { id: 5, name: "Orange" },
  { id: 6, name: "Autre" }
];

export default function AddOrUpdateForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel 
}: AddOrUpdateFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColourPicker, setShowColourPicker] = useState(false);

  const [formData, setFormData] = useState<BottleFormData>({
    bottle: {
      name: initialData?.bottle?.name || "",
      domain: initialData?.bottle?.domain || "",
      PDO: initialData?.bottle?.PDO || "",
      colour_id: initialData?.bottle?.colour_id || null,
    },
    vintage: {
      year: initialData?.vintage?.year || "",
    },
    stock: initialData?.stock || "",
    rating: initialData?.rating || "",
    price: initialData?.price || "",
    shop: initialData?.shop || "",
    offered_by: initialData?.offered_by || "",
    drinking_window_start: initialData?.drinking_window_start || "",
    drinking_window_end: initialData?.drinking_window_end || "",
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'add') {
      if (!formData.bottle.name.trim()) {
        newErrors['bottle.name'] = "Le nom de la bouteille est requis";
      }
      if (!formData.bottle.colour_id) {
        newErrors['bottle.colour_id'] = "La couleur est requise";
      }
      if (!formData.vintage.year.trim()) {
        newErrors['vintage.year'] = "Le millésime est requis";
      }
      if (!formData.stock.trim()) {
        newErrors['stock'] = "Le stock est requis";
      }
    }

    const year = parseInt(formData.vintage.year);
    if (formData.vintage.year && (isNaN(year) || year < 1900 || year > 2100)) {
      newErrors['vintage.year'] = "Année invalide (1900-2100)";
    }

    const stock = parseInt(formData.stock);
    if (formData.stock && (isNaN(stock) || stock < 0)) {
      newErrors['stock'] = "Stock invalide (minimum 0)";
    }

    const rating = parseFloat(formData.rating);
    if (formData.rating && (isNaN(rating) || rating < 0 || rating > 5)) {
      newErrors['rating'] = "Note invalide (0-5)";
    }

    const price = parseFloat(formData.price);
    if (formData.price && (isNaN(price) || price < 0)) {
      newErrors['price'] = "Prix invalide";
    }

    const startYear = parseInt(formData.drinking_window_start);
    const endYear = parseInt(formData.drinking_window_end);
    if (formData.drinking_window_start && formData.drinking_window_end) {
      if (endYear < startYear) {
        newErrors['drinking_window_end'] = "L'année de fin doit être supérieure ou égale à l'année de début";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    const keys = field.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (keys.length === 2) {
        const [parent, child] = keys;
        (newData as any)[parent] = {
          ...(newData as any)[parent],
          [child]: value
        };
      } else {
        (newData as any)[field] = value;
      }
      
      return newData;
    });

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const selectColour = (colourId: number) => {
    updateField('bottle.colour_id', colourId);
    setShowColourPicker(false);
  };

  const setRating = (stars: number) => {
    updateField('rating', stars.toString());
  };

  const selectedColour = COLOURS.find(c => c.id === formData.bottle.colour_id);
  const currentRating = parseFloat(formData.rating) || 0;

  return (
    <View>
      <View className="pb-5 pt-16 pl-2 bg-wine">
        <PageTitle text={mode === 'add' ? 'Ajouter une bouteille' : 'Modifier la bouteille'} color="white" />
      </View>

      <View className="m-6 bg-white p-6 border border-lightgray rounded-lg">
        <Text className="font-bold text-xl pb-4">Informations principales</Text>
        {mode === 'add' && (
          <>
            <Text className="text-base font-semibold text-gray mb-2">Nom de la bouteille *</Text>
            <TextInput
              value={formData.bottle.name}
              onChangeText={(value) => updateField('bottle.name', value)}
              placeholder="Ex: A l'ombre du figuier"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
            />
            {errors['bottle.name'] && (
              <Text className="text-red-600 text-sm mb-4">{errors['bottle.name']}</Text>
            )}

            <Text className="text-base font-semibold text-gray mb-2">Domaine</Text>
            <TextInput
              value={formData.bottle.domain}
              onChangeText={(value) => updateField('bottle.domain', value)}
              placeholder="Ex: Mas de la Seranne"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            <Text className="text-base font-semibold text-gray mb-2">Appellation</Text>
            <TextInput
              value={formData.bottle.PDO}
              onChangeText={(value) => updateField('bottle.PDO', value)}
              placeholder="Ex: AOP Languedoc"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            <Text className="text-base font-semibold text-gray mb-2">Couleur *</Text>
            <TouchableOpacity
              onPress={() => setShowColourPicker(!showColourPicker)}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center"
            >
              <Text className={selectedColour ? "text-black" : "text-gray-400"}>
                {selectedColour ? selectedColour.name : "Sélectionnez une couleur"}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            {showColourPicker && (
              <View className="border border-gray-300 rounded-lg mb-2">
                {COLOURS.map((colour) => (
                  <TouchableOpacity
                    key={colour.id}
                    onPress={() => selectColour(colour.id)}
                    className="px-4 py-3 border-b border-gray-200"
                  >
                    <Text className="text-base">{colour.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {errors['bottle.colour_id'] && (
              <Text className="text-red-600 text-sm mb-4">{errors['bottle.colour_id']}</Text>
            )}

            <Text className="text-base font-semibold text-gray mb-2">Millésime *</Text>
            <TextInput
              value={formData.vintage.year}
              onChangeText={(value) => updateField('vintage.year', value)}
              placeholder="Ex: 2015"
              keyboardType="numeric"
              maxLength={4}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
            />
            {errors['vintage.year'] && (
              <Text className="text-red-600 text-sm mb-4">{errors['vintage.year']}</Text>
            )}
          </>
        )}
      </View>

      <View className="m-6 bg-white p-6 border border-lightgray rounded-lg">
        <Text className="font-bold text-xl pb-4">Informations d'achat</Text>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray mb-2">Quantité *</Text>
            <TextInput
              value={formData.stock}
              onChangeText={(value) => updateField('stock', value)}
              placeholder="Ex: 6"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            {errors['stock'] && (
              <Text className="text-red-600 text-sm mt-1">{errors['stock']}</Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-gray mb-2">Prix (€)</Text>
            <TextInput
              value={formData.price}
              onChangeText={(value) => updateField('price', value)}
              placeholder="Ex: 15.50"
              keyboardType="decimal-pad"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            {errors['price'] && (
              <Text className="text-red-600 text-sm mt-1">{errors['price']}</Text>
            )}
          </View>
        </View>

        <Text className="text-base font-semibold text-gray mb-2">Lieu d'achat</Text>
        <TextInput
          value={formData.shop}
          onChangeText={(value) => updateField('shop', value)}
          placeholder="Ex: Cave Dupont"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />

        <Text className="text-base font-semibold text-gray mb-2">Offert par</Text>
        <TextInput
          value={formData.offered_by}
          onChangeText={(value) => updateField('offered_by', value)}
          placeholder="Nom de la personne"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />
      </View>

      <View className="m-6 bg-white p-6 border border-lightgray rounded-lg">
        <Text className="font-bold text-xl pb-4">Période de garde</Text>
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray mb-2">Début de garde</Text>
            <TextInput
              value={formData.drinking_window_start}
              onChangeText={(value) => updateField('drinking_window_start', value)}
              placeholder="2025"
              keyboardType="numeric"
              maxLength={4}
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray mb-2">Fin de garde</Text>
            <TextInput
              value={formData.drinking_window_end}
              onChangeText={(value) => updateField('drinking_window_end', value)}
              placeholder="2035"
              keyboardType="numeric"
              maxLength={4}
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
          </View>
        </View>
        {errors['drinking_window_end'] && (
          <Text className="text-red-600 text-sm mb-4">{errors['drinking_window_end']}</Text>
        )}
      </View>

      <View className="m-6 bg-white p-6 border border-lightgray rounded-lg">
        <Text className="font-bold text-xl pb-4">Notes personnelles</Text>
        <Text className="text-base font-semibold text-gray mb-3">Note globale</Text>
        <View className="flex-row items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              className="p-1"
            >
              <Star
                size={40}
                color="#bb2700"
                fill={star <= currentRating ? "#bb2700" : "transparent"}
              />
            </TouchableOpacity>
          ))}
          {currentRating > 0 && (
            <Text className="text-gray ml-2 text-base">
              {currentRating}/5
            </Text>
          )}
        </View>
        {errors['rating'] && (
          <Text className="text-red-600 text-sm mt-2">{errors['rating']}</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#bb2700" className="my-4" />
      ) : (
        <View className="gap-2 m-6">
          <PrimaryButton 
            text={mode === 'add' ? 'Ajouter' : 'Modifier'} 
            onPress={handleSubmit} 
          />
          {onCancel && (
            <SecondaryButton text="Annuler" onPress={onCancel} />
          )}
        </View>
      )}
    </View>
  );
}