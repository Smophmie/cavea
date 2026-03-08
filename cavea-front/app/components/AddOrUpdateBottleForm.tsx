import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Modal, FlatList } from "react-native";
import { ChevronDown, X } from "lucide-react-native";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import PageTitle from "./PageTitle";
import BackButton from "./BackButton";
import { cellarService } from "@/services/CellarService";
import { REGIONS, COLOURS, GRAPE_VARIETIES } from "@/constants/wineData";

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
  price: string;
  shop: string;
  offered_by: string;
  drinking_window_start: string;
  drinking_window_end: string;
}

interface AddOrUpdateFormProps {
  mode: 'add' | 'update';
  bottleId?: number;
  token?: string;
  initialData?: Partial<BottleFormInput>;
  onSubmit: (data: BottleFormData) => Promise<void>;
}

export default function AddOrUpdateBottleForm({ 
  mode, 
  bottleId,
  token,
  initialData, 
  onSubmit
}: AddOrUpdateFormProps) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColourPicker, setShowColourPicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showGrapeVarietyPicker, setShowGrapeVarietyPicker] = useState(false);
  const [yearPickerField, setYearPickerField] = useState<'vintage.year' | 'drinking_window_start' | 'drinking_window_end' | null>(null);

  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: currentYear - 1901 + 1 }, (_, i) => String(currentYear - i));

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
    price: initialData?.price || "",
    shop: initialData?.shop || "",
    offered_by: initialData?.offered_by || "",
    drinking_window_start: initialData?.drinking_window_start || "",
    drinking_window_end: initialData?.drinking_window_end || "",
  });

  useEffect(() => {
    if (mode === 'update' && bottleId && !initialData && token) {
      fetchBottleData();
    }
  }, [mode, bottleId, token]);

  const fetchBottleData = async () => {
    if (!bottleId || !token) return;
    
    setDataLoading(true);
    try {
      const data = await cellarService.getCellarItemById(token, bottleId);
      
      setFormData({
        bottle: {
          name: data.bottle.name,
          domain_name: data.bottle.domain.name,
          colour_id: data.bottle.colour.id,
          region_id: data.bottle.region?.id || null,
          grape_variety_ids: data.bottle.grapeVarieties?.map((gv: any) => gv.id) || [],
        },
        vintage: {
          year: String(data.vintage.year),
        },
        appellation_name: data.appellation?.name || "",
        stock: String(data.stock),
        price: data.price ? String(data.price) : "",
        shop: data.shop || "",
        offered_by: data.offered_by || "",
        drinking_window_start: data.drinking_window_start ? String(data.drinking_window_start) : "",
        drinking_window_end: data.drinking_window_end ? String(data.drinking_window_end) : "",
      });
    } catch (error) {
      console.error('Error fetching bottle data:', error);
    } finally {
      setDataLoading(false);
    }
  };

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
    if (formData.vintage.year && (isNaN(year) || year < 1901 || year > 2026)) {
      newErrors['vintage.year'] = "Année invalide (1901-2026)";
    }

    const stock = parseInt(formData.stock);
    if (formData.stock && (isNaN(stock) || stock < 0)) {
      newErrors['stock'] = "Stock invalide (minimum 0)";
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

  const toggleGrapeVariety = (grapeVarietyId: number) => {
    const currentIds = formData.bottle.grape_variety_ids;
    const newIds = currentIds.includes(grapeVarietyId)
      ? currentIds.filter(id => id !== grapeVarietyId)
      : [...currentIds, grapeVarietyId];
    
    updateField('bottle.grape_variety_ids', newIds);
  };

  const removeGrapeVariety = (grapeVarietyId: number) => {
    const newIds = formData.bottle.grape_variety_ids.filter(id => id !== grapeVarietyId);
    updateField('bottle.grape_variety_ids', newIds);
  };

  const selectedColour = COLOURS.find(c => c.id === formData.bottle.colour_id);
  const selectedRegion = REGIONS.find(r => r.id === formData.bottle.region_id);
  const selectedGrapeVarieties = GRAPE_VARIETIES.filter(gv =>
    formData.bottle.grape_variety_ids.includes(gv.id)
  );

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="pb-5 pt-16 px-10 bg-wine">
        <View className="mb-4">
          <BackButton color="#ffffff" />
        </View>
        <PageTitle text={mode === 'add' ? 'Ajouter une bouteille' : 'Modifier la bouteille'} color="white" />
      </View>

      {dataLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#730b1e" />
          <Text className="text-gray-500 mt-4">Chargement des données...</Text>
        </View>
      ) : (
        <>
          <View className="m-6 bg-white p-6 border border-lightgray rounded-lg">
            <Text className="font-bold text-xl pb-4">Informations principales</Text>
            
            {mode === 'add' ? (
              <>
                <Text className="text-base font-semibold text-gray mb-2">Nom de la bouteille *</Text>
                <TextInput placeholderTextColor="#9CA3AF"
                  value={formData.bottle.name}
                  onChangeText={(value) => updateField('bottle.name', value)}
                  placeholder="Ex: A l'ombre du figuier"
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
                />
                {errors['bottle.name'] && (
                  <Text className="text-red-600 text-sm mb-4">{errors['bottle.name']}</Text>
                )}
              </>
            ) : (
              <>
                <Text className="text-base font-semibold text-gray mb-2">Nom du vin</Text>
                <Text className="text-base text-black mb-4">{formData.bottle.name}</Text>
              </>
            )}

            {mode === 'add' ? (
              <>
                <Text className="text-base font-semibold text-gray mb-2">Domaine *</Text>
                <TextInput placeholderTextColor="#9CA3AF"
                  value={formData.bottle.domain_name}
                  onChangeText={(value) => updateField('bottle.domain_name', value)}
                  placeholder="Ex: Mas de la Seranne"
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
                />
                {errors['bottle.domain_name'] && (
                  <Text className="text-red-600 text-sm mb-4">{errors['bottle.domain_name']}</Text>
                )}
              </>
            ) : (
              <>
                <Text className="text-base font-semibold text-gray mb-2">Domaine/Producteur</Text>
                <Text className="text-base text-black mb-4">{formData.bottle.domain_name}</Text>
              </>
            )}

            {mode === 'add' ? (
              <>
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

                <Modal
                  visible={showRegionPicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowRegionPicker(false)}
                >
                  <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '70%' }}>
                      <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                        <Text className="text-lg font-bold">Sélectionnez une région</Text>
                        <TouchableOpacity onPress={() => setShowRegionPicker(false)}>
                          <X size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={REGIONS}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => selectRegion(item.id)}
                        className="px-4 py-4 border-b border-gray-100"
                      >
                        <Text className="text-base">{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>

                {errors['bottle.region_id'] && (
                  <Text className="text-red-600 text-sm mb-4">{errors['bottle.region_id']}</Text>
                )}
              </>
            ) : (
              <>
                <Text className="text-base font-semibold text-gray mb-2">Région</Text>
                <Text className="text-base text-black mb-4">{selectedRegion?.name || "Non spécifiée"}</Text>
              </>
            )}

            {mode === 'update' && (
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray mb-2">Millésime</Text>
                  <Text className="text-base text-black">{formData.vintage.year}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray mb-2">Couleur</Text>
                  <Text className="text-base text-black">{selectedColour?.name || "Non spécifiée"}</Text>
                </View>
              </View>
            )}

            <Text className="text-base font-semibold text-gray mb-2">Appellation (AOC/AOP)</Text>
            <TextInput placeholderTextColor="#9CA3AF"
              value={formData.appellation_name}
              onChangeText={(value) => updateField('appellation_name', value)}
              placeholder="Ex: AOP Languedoc"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            <Text className="text-base font-semibold text-gray mb-2">Cépages</Text>
            
            {selectedGrapeVarieties.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-2">
                {selectedGrapeVarieties.map((gv) => (
                  <View key={gv.id} className="bg-wine rounded-full px-3 py-1 flex-row items-center">
                    <Text className="text-white text-sm mr-1">{gv.name}</Text>
                    <TouchableOpacity onPress={() => removeGrapeVariety(gv.id)}>
                      <X size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowGrapeVarietyPicker(!showGrapeVarietyPicker)}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center"
            >
              <Text className="text-gray-400">
                {selectedGrapeVarieties.length > 0 ? "Modifier les cépages" : "Ajouter des cépages"}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            <Modal
              visible={showGrapeVarietyPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowGrapeVarietyPicker(false)}
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl" style={{ maxHeight: '70%' }}>
                  <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                    <Text className="text-lg font-bold">Sélectionnez des cépages</Text>
                    <TouchableOpacity onPress={() => setShowGrapeVarietyPicker(false)} testID="close-modal-grape-varieties">
                      <X size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    initialNumToRender={GRAPE_VARIETIES.length}
                    data={GRAPE_VARIETIES}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => toggleGrapeVariety(item.id)}
                        className="px-4 py-4 border-b border-gray-100 flex-row justify-between items-center"
                      >
                        <Text className="text-base">{item.name}</Text>
                        {formData.bottle.grape_variety_ids.includes(item.id) && (
                          <View className="w-6 h-6 rounded-full bg-wine items-center justify-center">
                            <Text className="text-white text-sm">✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>

            <Modal
              visible={yearPickerField !== null}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setYearPickerField(null)}
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl" style={{ maxHeight: '60%' }}>
                  <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                    <Text className="text-lg font-bold">Sélectionner une année</Text>
                    <TouchableOpacity onPress={() => setYearPickerField(null)}>
                      <X size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    initialNumToRender={YEARS.length}
                    data={YEARS}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                      const currentValue = yearPickerField === 'vintage.year'
                        ? formData.vintage.year
                        : yearPickerField === 'drinking_window_start'
                        ? formData.drinking_window_start
                        : formData.drinking_window_end;
                      const isSelected = item === currentValue;
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            updateField(yearPickerField!, item);
                            setYearPickerField(null);
                          }}
                          className="px-4 py-4 border-b border-gray-100 flex-row justify-between items-center"
                        >
                          <Text className={`text-base ${isSelected ? "font-bold text-wine" : ""}`}>{item}</Text>
                          {isSelected && (
                            <View className="w-6 h-6 rounded-full bg-wine items-center justify-center">
                              <Text className="text-white text-sm">✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </View>
            </Modal>

            {mode === 'add' ? (
              <>
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
              </>
            ) : null}

            {mode === 'add' && (
              <>
                <Text className="text-base font-semibold text-gray mb-2">Millésime *</Text>
                <TouchableOpacity
                  onPress={() => setYearPickerField('vintage.year')}
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center"
                >
                  <Text className={formData.vintage.year ? "text-black" : "text-gray-400"}>
                    {formData.vintage.year || "Sélectionner une année"}
                  </Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
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
            <TextInput placeholderTextColor="#9CA3AF"
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
            <TextInput placeholderTextColor="#9CA3AF"
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
        <TextInput placeholderTextColor="#9CA3AF"
          value={formData.shop}
          onChangeText={(value) => updateField('shop', value)}
          placeholder="Ex: Cave Dupont"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />

        <Text className="text-base font-semibold text-gray mb-2">Offert par</Text>
        <TextInput placeholderTextColor="#9CA3AF"
          value={formData.offered_by}
          onChangeText={(value) => updateField('offered_by', value)}
          placeholder="Nom de la personne"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />
      </View>

      <View className="m-6 bg-white p-6 border border-lightgray rounded-lg">
        <Text className="font-bold text-xl pb-4">Période de dégustation optimale</Text>
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray mb-2">Début</Text>
            <TouchableOpacity
              onPress={() => setYearPickerField('drinking_window_start')}
              className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
            >
              <Text className={formData.drinking_window_start ? "text-black" : "text-gray-400"}>
                {formData.drinking_window_start || "Année"}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray mb-2">Fin</Text>
            <TouchableOpacity
              onPress={() => setYearPickerField('drinking_window_end')}
              className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
            >
              <Text className={formData.drinking_window_end ? "text-black" : "text-gray-400"}>
                {formData.drinking_window_end || "Année"}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        {errors['drinking_window_end'] && (
          <Text className="text-red-600 text-sm mb-4">{errors['drinking_window_end']}</Text>
        )}
      </View>

        </>
      )}

      {!dataLoading && (
        <>
          {loading ? (
            <ActivityIndicator size="large" color="#730b1e" className="my-4" />
          ) : (
            <View className="m-6">
              <PrimaryButton 
                text={mode === 'add' ? 'Ajouter' : 'Modifier'} 
                onPress={handleSubmit} 
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
