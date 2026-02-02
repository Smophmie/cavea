import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { ChevronDown, Star } from "lucide-react-native";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import PageTitle from "./PageTitle";

interface BottleFormData {
  bottle: {
    name: string;
    domain_name: string;
    colour_id: number;
    region_id: number;
    grape_variety_ids?: number[];
  };
  vintage: {
    year: number;
  };
  appellation_name?: string;
  stock: number;
  rating?: number;
  price?: number;
  shop?: string;
  offered_by?: string;
  drinking_window_start?: number;
  drinking_window_end?: number;
}

interface BottleFormInput {
  bottle: {
    name: string;
    domain_name: string;
    colour_id: number | null;
    region_id: number | null;
    grape_variety_ids: number[];
  };
  vintage: {
    year: string;
  };
  appellation_name: string;
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
  initialData?: Partial<BottleFormInput>;
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

const REGIONS = [
  { id: 1, name: "Alsace" },
  { id: 2, name: "Beaujolais" },
  { id: 3, name: "Bordeaux" },
  { id: 4, name: "Bourgogne" },
  { id: 5, name: "Champagne" },
  { id: 6, name: "Corse" },
  { id: 7, name: "Jura" },
  { id: 8, name: "Languedoc" },
  { id: 9, name: "Roussillon" },
  { id: 10, name: "Lorraine" },
  { id: 11, name: "Provence" },
  { id: 12, name: "Savoie et Bugey" },
  { id: 13, name: "Sud-Ouest" },
  { id: 14, name: "Vallée de la Loire" },
  { id: 15, name: "Vallée du Rhône" },
  { id: 16, name: "Île-de-France" },
  { id: 17, name: "Poitou-Charentes" },
];

export default function AddOrUpdateBottleForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel 
}: AddOrUpdateFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColourPicker, setShowColourPicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const [formData, setFormData] = useState<BottleFormInput>({
    bottle: {
      name: initialData?.bottle?.name || "",
      domain_name: initialData?.bottle?.domain_name || "",
      colour_id: initialData?.bottle?.colour_id || null,
      region_id: initialData?.bottle?.region_id || null,
      grape_variety_ids: initialData?.bottle?.grape_variety_ids || [],
    },
    vintage: {
      year: initialData?.vintage?.year || "",
    },
    appellation_name: initialData?.appellation_name || "",
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
      if (!formData.bottle.domain_name.trim()) {
        newErrors['bottle.domain_name'] = "Le domaine est requis";
      }
      if (!formData.bottle.colour_id) {
        newErrors['bottle.colour_id'] = "La couleur est requise";
      }
      if (!formData.bottle.region_id) {
        newErrors['bottle.region_id'] = "La région est requise";
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
    if (formData.rating && (isNaN(rating) || rating < 0 || rating > 10)) {
      newErrors['rating'] = "Note invalide (0-10)";
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
      const bottleData: BottleFormData = {
        bottle: {
          name: formData.bottle.name,
          domain_name: formData.bottle.domain_name,
          colour_id: formData.bottle.colour_id!,
          region_id: formData.bottle.region_id!,
          ...(formData.bottle.grape_variety_ids.length > 0 && { 
            grape_variety_ids: formData.bottle.grape_variety_ids 
          }),
        },
        vintage: {
          year: parseInt(formData.vintage.year),
        },
        stock: parseInt(formData.stock),
        ...(formData.appellation_name && { appellation_name: formData.appellation_name }),
        ...(formData.rating && { rating: parseFloat(formData.rating) }),
        ...(formData.price && { price: parseFloat(formData.price) }),
        ...(formData.shop && { shop: formData.shop }),
        ...(formData.offered_by && { offered_by: formData.offered_by }),
        ...(formData.drinking_window_start && { 
          drinking_window_start: parseInt(formData.drinking_window_start) 
        }),
        ...(formData.drinking_window_end && { 
          drinking_window_end: parseInt(formData.drinking_window_end) 
        }),
      };
      
      await onSubmit(bottleData);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number | number[]) => {
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

  const selectRegion = (regionId: number) => {
    updateField('bottle.region_id', regionId);
    setShowRegionPicker(false);
  };

  const setRating = (stars: number) => {
    const currentRatingValue = parseFloat(formData.rating) || 0;
    
    // If clicking the same star, toggle between full and half star
    if (stars === Math.ceil(currentRatingValue)) {
      if (currentRatingValue === stars) {
        // Full star -> half star
        updateField('rating', (stars - 0.5).toString());
      } else {
        // Half star -> full star
        updateField('rating', stars.toString());
      }
    } else {
      // Different star -> set full star
      updateField('rating', stars.toString());
    }
  };

  const selectedColour = COLOURS.find(c => c.id === formData.bottle.colour_id);
  const selectedRegion = REGIONS.find(r => r.id === formData.bottle.region_id);
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

            <Text className="text-base font-semibold text-gray mb-2">Domaine *</Text>
            <TextInput
              value={formData.bottle.domain_name}
              onChangeText={(value) => updateField('bottle.domain_name', value)}
              placeholder="Ex: Mas de la Seranne"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
            />
             {errors['bottle.domain_name'] && (
              <Text className="text-red-600 text-sm mb-4">{errors['bottle.domain_name']}</Text>
            )}

            <Text className="text-base font-semibold text-gray mb-2">Région *</Text>
            <TouchableOpacity
              onPress={() => setShowRegionPicker(!showRegionPicker)}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center"
            >
              <Text className={selectedRegion ? "text-black" : "text-gray-400"}>
                {selectedRegion ? selectedRegion.name : "Sélectionnez une région"}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            {showRegionPicker && (
              <View className="border border-gray-300 rounded-lg mb-2 max-h-60">
                {REGIONS.map((region) => (
                  <TouchableOpacity
                    key={region.id}
                    onPress={() => selectRegion(region.id)}
                    className="px-4 py-3 border-b border-gray-200"
                  >
                    <Text className="text-base">{region.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {errors['bottle.region_id'] && (
              <Text className="text-red-600 text-sm mb-4">{errors['bottle.region_id']}</Text>
            )}

            <Text className="text-base font-semibold text-gray mb-2">Appellation</Text>
            <TextInput
              value={formData.appellation_name}
              onChangeText={(value) => updateField('appellation_name', value)}
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
        <Text className="text-base font-semibold text-gray mb-3">Ma note</Text>
        <View className="flex-row items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
            const isFilled = currentRating >= star;
            const isHalfFilled = !isFilled && currentRating >= star - 0.5;
            
            let fillColor = "transparent";
            if (isFilled) {
              fillColor = "#bb2700";
            } else if (isHalfFilled) {
              fillColor = "rgba(187, 39, 0, 0.5)";
            }
            
            return (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="p-1"
              >
                <Star
                  size={30}
                  color="#bb2700"
                  fill={fillColor}
                />
              </TouchableOpacity>
            );
          })}
          {currentRating > 0 && (
          <Text className="text-gray mt-2 text-base">
            {currentRating}/10
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