import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator } from "react-native";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

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

  const updateField = (field: string, value: string) => {
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

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-playfairbold text-wine mb-6">
          {mode === 'add' ? 'Ajouter une bouteille' : 'Modifier la bouteille'}
        </Text>

        {mode === 'add' && (
          <>
            <Text className="text-base font-semibold text-gray mb-2">Nom de la bouteille *</Text>
            <TextInput
              value={formData.bottle.name}
              onChangeText={(value) => updateField('bottle.name', value)}
              placeholder="Ex: Château Margaux"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
            />
            {errors['bottle.name'] && (
              <Text className="text-red-600 text-sm mb-4">{errors['bottle.name']}</Text>
            )}

            <Text className="text-base font-semibold text-gray mb-2">Domaine</Text>
            <TextInput
              value={formData.bottle.domain}
              onChangeText={(value) => updateField('bottle.domain', value)}
              placeholder="Ex: Domaine Leflaive"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            <Text className="text-base font-semibold text-gray mb-2">Appellation (PDO)</Text>
            <TextInput
              value={formData.bottle.PDO}
              onChangeText={(value) => updateField('bottle.PDO', value)}
              placeholder="Ex: Pauillac, Bourgogne"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            <Text className="text-base font-semibold text-gray mb-2">Couleur *</Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {COLOURS.map((colour) => (
                <SecondaryButton
                  key={colour.id}
                  text={colour.name}
                  onPress={() => updateField('bottle.colour_id', colour.id.toString())}
                />
              ))}
            </View>
            {formData.bottle.colour_id && (
              <Text className="text-sm text-gray mb-2">
                Sélectionné: {COLOURS.find(c => c.id === formData.bottle.colour_id)?.name}
              </Text>
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

        <Text className="text-base font-semibold text-gray mb-2">Stock *</Text>
        <TextInput
          value={formData.stock}
          onChangeText={(value) => updateField('stock', value)}
          placeholder="Nombre de bouteilles"
          keyboardType="numeric"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
        />
        {errors['stock'] && (
          <Text className="text-red-600 text-sm mb-4">{errors['stock']}</Text>
        )}

        <Text className="text-base font-semibold text-gray mb-2">Note (0-5)</Text>
        <TextInput
          value={formData.rating}
          onChangeText={(value) => updateField('rating', value)}
          placeholder="Ex: 4.5"
          keyboardType="decimal-pad"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
        />
        {errors['rating'] && (
          <Text className="text-red-600 text-sm mb-4">{errors['rating']}</Text>
        )}

        <Text className="text-base font-semibold text-gray mb-2">Prix</Text>
        <TextInput
          value={formData.price}
          onChangeText={(value) => updateField('price', value)}
          placeholder="Prix d'achat"
          keyboardType="decimal-pad"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
        />
        {errors['price'] && (
          <Text className="text-red-600 text-sm mb-4">{errors['price']}</Text>
        )}

        <Text className="text-base font-semibold text-gray mb-2">Magasin</Text>
        <TextInput
          value={formData.shop}
          onChangeText={(value) => updateField('shop', value)}
          placeholder="Lieu d'achat"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />

        <Text className="text-base font-semibold text-gray mb-2">Offert par</Text>
        <TextInput
          value={formData.offered_by}
          onChangeText={(value) => updateField('offered_by', value)}
          placeholder="Nom de la personne"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />

        <Text className="text-base font-semibold text-gray mb-2">Fenêtre de dégustation</Text>
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray mb-2">Début</Text>
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
            <Text className="text-sm text-gray mb-2">Fin</Text>
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

        {loading ? (
          <ActivityIndicator size="large" color="#bb2700" className="my-4" />
        ) : (
          <View className="gap-2 mt-4">
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
    </ScrollView>
  );
}