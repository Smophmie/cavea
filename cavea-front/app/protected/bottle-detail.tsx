import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Wine, MapPin, Calendar, Euro, Package, Pencil, Trash2, Star, MessageSquarePlus } from "lucide-react-native";
import { useState, useCallback, useEffect } from "react";
import Slider from "@react-native-community/slider";
import { useAuth } from "@/authentication/AuthContext";
import { cellarService } from "@/services/CellarService";
import BackButton from "../components/BackButton";
import PrimaryButton from "../components/PrimaryButton";

interface BottleDetail {
  id: number;
  stock: number;
  price?: number;
  rating?: number;
  shop?: string;
  offered_by?: string;
  drinking_window_start?: number;
  drinking_window_end?: number;
  bottle: {
    name: string;
    domain: {
      name: string;
    };
    region: {
      name: string;
    } | null;
    colour: {
      name: string;
    };
    grape_varieties?: Array<{
      id: number;
      name: string;
    }>;
  };
  vintage: {
    year: number;
  };
  appellation: {
    name: string;
  } | null;
  comments?: Array<{
    id: number;
    content: string;
    date: string;
  }>;
}

export default function BottleDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [bottleData, setBottleData] = useState<BottleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sliderRating, setSliderRating] = useState<number>(0);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  const fetchBottleData = async () => {
    if (!token || !id) return;

    setLoading(true);
    try {
      const data = await cellarService.getCellarItemById(token, Number(id));
      setBottleData(data);
    } catch (error) {
      console.error('Error fetching bottle data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBottleData();
    }, [token, id])
  );

  useEffect(() => {
    if (bottleData?.rating) setSliderRating(Number(bottleData.rating));
  }, [bottleData]);

  const handleSaveRating = async () => {
    if (!token || !id) return;
    setIsSavingRating(true);
    try {
      await cellarService.updateCellarItem(token, Number(id), { rating: sliderRating });
      await fetchBottleData();
      setIsEditingRating(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingRating(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/protected/update-bottle",
      params: { id }
    } as any);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleAddComment = async () => {
    if (!token || !id || !newComment.trim()) return;
    setIsSavingComment(true);
    try {
      await cellarService.addComment(token, Number(id), newComment.trim());
      setNewComment("");
      await fetchBottleData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !id) return;
    try {
      await cellarService.deleteComment(token, Number(id), commentId);
      await fetchBottleData();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    if (!token || !id) return;
    try {
      await cellarService.deleteCellarItem(token, Number(id));
      router.replace("/protected/dashboard");
    } catch (error) {
      console.error('Error deleting bottle:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-app items-center justify-center">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    );
  }

  if (!bottleData) {
    return (
      <View className="flex-1 bg-app items-center justify-center">
        <Text className="text-gray-500">Bouteille non trouvée</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
    <ScrollView className="flex-1 bg-app" keyboardShouldPersistTaps="handled">
      <View className="w-full bg-wine px-10 py-14">
        <View className="flex-row justify-between items-center mb-8">
          <BackButton color="#ffffff" />

          <View className="flex-row">
            <Pressable onPress={handleEdit} style={{ padding: 8 }}>
              <Pencil size={20} color="#ffffff" />
            </Pressable>
            <Pressable onPress={handleDelete} style={{ padding: 8 }}>
              <Trash2 size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-start gap-4">
          <View>
            <Wine size={65} color="#ffffff" />
          </View>

          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-2">
              {bottleData.bottle.name}
            </Text>
            <Text className="text-white text-lg">
              {bottleData.vintage.year}
            </Text>
            <Text className="text-white text-lg mt-1">
              {bottleData.bottle.domain.name}
            </Text>
          </View>
        </View>
      </View>

      <View className="mx-6 mt-6 bg-white rounded-lg border border-lightgray p-6">
        <View className="flex-row flex-wrap">
          <View className="w-1/2 mb-6">
            <View className="flex-row items-center mb-2">
              <MapPin size={20} color="#730b1e" />
              <Text className="text-gray-500 text-base font-bold ml-2">Région</Text>
            </View>
            <Text className="text-black text-base">
              {bottleData.bottle.region?.name || "Non spécifiée"}
            </Text>
          </View>

          <View className="w-1/2 mb-6">
            <View className="flex-row items-center mb-2">
              <Calendar size={20} color="#730b1e" />
              <Text className="text-gray-500 text-base font-bold ml-2">Millésime</Text>
            </View>
            <Text className="text-black text-base">
              {bottleData.vintage.year}
            </Text>
          </View>

          {bottleData.price && (
            <View className="w-1/2 mb-6">
              <View className="flex-row items-center mb-2">
                <Euro size={20} color="#730b1e" />
                <Text className="text-gray-500 text-base font-bold ml-2">Prix</Text>
              </View>
              <Text className="text-black text-base">
                {bottleData.price % 1 === 0 ? bottleData.price : bottleData.price.toFixed(2)}€
              </Text>
            </View>
          )}

          <View className="w-1/2 mb-6">
            <View className="flex-row items-center mb-2">
              <Package size={20} color="#730b1e" />
              <Text className="text-gray-500 text-base font-bold ml-2">Quantité</Text>
            </View>
            <Text className="text-black text-base">
              x{bottleData.stock}
            </Text>
          </View>
        </View>
      </View>

      <View className="mx-6 mt-6 bg-white rounded-lg border border-lightgray p-6">
        <Text className="text-xl font-bold text-black mb-4">Détails</Text>

        <View className="mb-4">
          <Text className="text-gray-500 text-base font-bold mb-1">Appellation</Text>
          <Text className="text-black text-base">
            {bottleData.appellation?.name || "Non spécifiée"}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-500 text-base font-bold mb-1">Cépages</Text>
          <Text className="text-black text-base">
            {bottleData.bottle.grape_varieties && bottleData.bottle.grape_varieties.length > 0
              ? bottleData.bottle.grape_varieties.map(gv => gv.name).join(', ')
              : "Non spécifiés"}
          </Text>
        </View>

        {bottleData.shop && (
          <View className="mb-4">
            <Text className="text-gray-500 text-base font-bold mb-1">Lieu d'achat</Text>
            <Text className="text-black text-base">{bottleData.shop}</Text>
          </View>
        )}

        {bottleData.offered_by && (
          <View className="mb-4">
            <Text className="text-gray-500 text-base font-bold mb-1">Offert par</Text>
            <Text className="text-black text-base">{bottleData.offered_by}</Text>
          </View>
        )}

        {(bottleData.drinking_window_start || bottleData.drinking_window_end) && (
          <View className="mb-4">
            <Text className="text-gray-500 text-base font-bold mb-1">Période de dégustation optimale</Text>
            <Text className="text-black text-base">
              {bottleData.drinking_window_start || '?'} - {bottleData.drinking_window_end || '?'}
            </Text>
          </View>
        )}
      </View>

      <View className="mx-6 mt-6 mb-6 bg-white rounded-lg border border-lightgray p-6">
        <Text className="text-xl font-bold text-black mb-4">Mes notes personnelles</Text>

        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-500 text-base font-bold">Ma note</Text>
            <TouchableOpacity onPress={() => setIsEditingRating(!isEditingRating)}>
              <Pencil size={16} color="#730b1e" />
            </TouchableOpacity>
          </View>
          {sliderRating > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, gap: 4 }}>
              <Star size={15} color="#f59e0b" fill="#f59e0b" />
              <Text style={{ fontSize: 14, color: '#d97706', fontWeight: '500' }}>
                {sliderRating % 1 === 0 ? sliderRating : sliderRating.toFixed(1)}/20
              </Text>
            </View>
          ) : (
            <Text className="text-black text-base">Non notée</Text>
          )}
          {isEditingRating && (
            <>
              <Slider
                minimumValue={0}
                maximumValue={20}
                step={0.5}
                value={Number(sliderRating)}
                onValueChange={(v) => setSliderRating(Number(v))}
                minimumTrackTintColor="#800020"
                maximumTrackTintColor="#d1d5db"
                thumbTintColor="#800020"
              />
              <Text className="text-black text-base text-center mb-2">
                {sliderRating % 1 === 0 ? sliderRating : sliderRating.toFixed(1)}/20
              </Text>
              <PrimaryButton
                text={isSavingRating ? "Enregistrement..." : "Enregistrer la note"}
                onPress={handleSaveRating}
              />
            </>
          )}
        </View>

        <View className="mt-4">
          <Text className="text-gray-500 text-base font-bold mb-3">Mes commentaires</Text>

          {bottleData.comments && bottleData.comments.length > 0 && (
            <View className="mb-4">
              {bottleData.comments.map((comment: any, index: number) => (
                <View key={comment.id || index} className="mb-3 p-3 rounded-lg flex-row justify-between items-start" style={{ backgroundColor: '#fdf3f5' }}>
                  <View className="flex-1 mr-2">
                    <Text className="text-black text-base">{comment.content}</Text>
                    {comment.date && (
                      <Text className="text-gray-400 text-xs mt-1">
                        {new Date(comment.date).toLocaleDateString('fr-FR')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                    <Trash2 size={16} color="#730b1e" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-black"
            style={{ textAlignVertical: 'top' }}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newComment.trim() || isSavingComment}
            className="flex-row items-center justify-center gap-2 py-3 rounded-lg"
            style={{ backgroundColor: newComment.trim() ? '#730b1e' : '#d1d5db' }}
          >
            {isSavingComment
              ? <ActivityIndicator size="small" color="#fff" />
              : <MessageSquarePlus size={18} color="#fff" />
            }
            <Text className="text-white font-semibold">Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1d293d', marginBottom: 8 }}>
              Supprimer la bouteille
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
              Êtes-vous sûr de vouloir supprimer cette bouteille ?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#6B7280', fontWeight: '500' }}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                style={{ flex: 1, backgroundColor: '#730b1e', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '500' }}>Supprimer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}