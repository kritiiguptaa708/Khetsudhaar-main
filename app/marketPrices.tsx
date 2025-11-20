import { supabase } from '@/utils/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const PIXEL_FONT = 'monospace';

// Image Map
const CROP_IMAGES: { [key: string]: any } = {
  banana: require('../assets/images/crops/banana.png'),
  coffee: require('../assets/images/crops/coffee.png'),
  black_pepper: require('../assets/images/crops/black_pepper.png'),
  coconut: require('../assets/images/crops/coconut.png'),
  cardamom: require('../assets/images/crops/cardamom.png'),
  ginger: require('../assets/images/crops/ginger.png'),
};

const PriceCard: React.FC<any> = ({ crop_id, name, unit, price, trend, change }) => {
  let trendColor = '#B0B0B0';
  let trendIcon = 'minus';
  let trendText = 'STABLE';

  if (trend === 'up') {
    trendColor = '#4CAF50';
    trendIcon = 'caret-up';
    trendText = `+${change}`;
  } else if (trend === 'down') {
    trendColor = '#C0392B';
    trendIcon = 'caret-down';
    trendText = `-${change}`;
  }

  const cropImageSource = CROP_IMAGES[crop_id] || null;

  return (
    <View style={styles.priceCard}>
      <View style={styles.cropVisuals}>
        {cropImageSource && <Image source={cropImageSource} style={styles.cropImage} />}
        <View style={styles.cropInfo}>
          <Text style={styles.cropTitle}>{name}</Text>
          <Text style={styles.cropUnit}>Price per {unit}</Text>
        </View>
      </View>
      <View style={styles.priceDetails}>
        <Text style={styles.cropPrice}>₹ {price}</Text>
        <View style={[styles.trendContainer, { borderColor: trendColor }]}>
          <FontAwesome5 name={trendIcon as any} size={14} color={trendColor} style={styles.trendIcon} />
          <Text style={[styles.trendText, { color: trendColor }]}>{trendText}</Text>
        </View>
      </View>
    </View>
  );
};

export default function MarketPricesScreen() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase.from('market_prices').select('*');
      if (!error && data) {
        setPrices(data);
      }
      setLoading(false);
    };
    fetchPrices();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#388e3c" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>ALL INDIA SPOT PRICES</Text>
            <Text style={styles.summaryDate}>Live Data</Text>
            <Text style={styles.summaryTip}>Prices fetched from mandi records.</Text>
          </View>
          <View style={styles.pricesList}>
            {prices.map((data) => <PriceCard key={data.id} {...data} />)}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#151718' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { paddingHorizontal: 15, paddingVertical: 20 },
  summaryBox: { backgroundColor: '#2C2C2E', borderRadius: 15, padding: 20, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#0277BD' },
  summaryTitle: { color: '#0277BD', fontSize: 18, fontWeight: 'bold', fontFamily: PIXEL_FONT, marginBottom: 5 },
  summaryDate: { color: '#DEDEDE', fontSize: 14, marginBottom: 10 },
  summaryTip: { color: '#B0B0B0', fontSize: 12, fontStyle: 'italic' },
  pricesList: { gap: 12 },
  priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#383838' },
  cropVisuals: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  cropImage: { width: 40, height: 40, borderRadius: 8, marginRight: 12, backgroundColor: '#1C1C1E' },
  cropInfo: { flex: 1 },
  cropTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', fontFamily: PIXEL_FONT, flexWrap: 'wrap' },
  cropUnit: { color: '#B0B0B0', fontSize: 14 },
  priceDetails: { alignItems: 'flex-end' },
  cropPrice: { color: '#FFD700', fontSize: 22, fontWeight: '900', fontFamily: PIXEL_FONT, marginBottom: 4 },
  trendContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  trendIcon: { marginRight: 4 },
  trendText: { fontSize: 14, fontWeight: 'bold' },
});