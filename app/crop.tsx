import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// --- 1. STATIC FALLBACK DATA ---
// This ensures the screen is never empty, even if DB is empty/offline.
const DEFAULT_CROPS = [
  { id: 'coffee', name: 'COFFEE' },
  { id: 'coconut', name: 'COCONUT' },
  { id: 'rice', name: 'RICE' },
  { id: 'banana', name: 'BANANA' },
  { id: 'cardamom', name: 'CARDAMOM' },
  { id: 'black_pepper', name: 'BLACK PEPPER' },
  { id: 'ginger', name: 'GINGER' },
  { id: 'cashew', name: 'CASHEW' },
];

// --- 2. IMAGE MAPPING ---
// Maps IDs to local assets (Required because React Native can't dynamic require)
const CROP_IMAGES: { [key: string]: any } = {
  banana: require('../assets/images/crops/banana.png'),
  coffee: require('../assets/images/crops/coffee.png'),
  coconut: require('../assets/images/crops/coconut.png'),
  rice: require('../assets/images/crops/rice.png'),
  cardamom: require('../assets/images/crops/cardamom.png'),
  black_pepper: require('../assets/images/crops/black_pepper.png'),
  ginger: require('../assets/images/crops/ginger.png'),
  cashew: require('../assets/images/crops/cashew.png'),
};

export default function CropScreen() {
  // Start with DEFAULT_CROPS so UI renders immediately
  const [crops, setCrops] = useState<any[]>(DEFAULT_CROPS);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Set false initially so we see defaults
  const router = useRouter();
  const { t, isLoading: isTransLoading } = useTranslation(); 

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        // Try to fetch dynamic list
        const { data, error } = await supabase.from('crops').select('*').order('name');
        
        // Only update if we actually got data back
        if (data && data.length > 0) {
          setCrops(data);
        }
      } catch (err) {
        console.log("Using default crops list");
      }
    };
    fetchCrops();
  }, []);

  const handleConfirm = async () => { 
    if (selectedCrop) {
      try {
        // 1. Save locally
        await AsyncStorage.setItem('onboarding_crop', selectedCrop);

        // 2. Save to DB if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('profiles').update({ selected_crop: selectedCrop }).eq('id', session.user.id);
        }

        // 3. Navigate to Lesson 1
        router.replace({ pathname: '/lesson/[id]', params: { id: '1' } }); 

      } catch (error) {
        console.error('Error saving crop:', error);
      }
    }
  };

  if (isTransLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#388e3c" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('choose_crop')}</Text>
        <Text style={styles.subtitle}>{t('choose_your_crop_in_hindi')}</Text>

        <View style={styles.gridContainer}>
          {crops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[
                styles.cropButton,
                selectedCrop === crop.id && styles.cropButtonSelected,
              ]}
              onPress={() => setSelectedCrop(crop.id)}>
              {/* Fallback to banana if ID doesn't match a known image */}
              <Image 
                source={CROP_IMAGES[crop.id] || CROP_IMAGES['banana']} 
                style={styles.cropImage} 
              />
              <Text style={styles.cropName}>{crop.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.confirmButton,
            selectedCrop ? styles.confirmButtonActive : styles.confirmButtonDisabled,
          ]}
          disabled={!selectedCrop}
          onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>{t('confirm')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#151718' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151718' },
  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#B0B0B0', fontSize: 18, textAlign: 'center', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', maxWidth: 400 },
  cropButton: { width: '48%', backgroundColor: '#333333', borderRadius: 15, padding: 10, alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#333333' },
  cropButtonSelected: { borderColor: '#388e3c' },
  cropImage: { width: 100, height: 100, marginBottom: 10, resizeMode: 'contain' },
  cropName: { color: '#FFFFFF', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  confirmButton: { width: '100%', maxWidth: 400, paddingVertical: 16, borderRadius: 30, marginTop: 20 },
  confirmButtonDisabled: { backgroundColor: '#555555' },
  confirmButtonActive: { backgroundColor: '#388e3c' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});