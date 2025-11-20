import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';

import { supabase } from '@/utils/supabase';
import Qcoin from '../assets/images/Qcoin.svg';
import Coin from '../assets/images/coin.svg';
import WinMascot from '../assets/images/winMascot.svg';

const PIXEL_FONT = 'monospace';

const RankRow = ({ rank, name, score, isUser = false }: any) => {
  let cardStyle: StyleProp<ViewStyle> = styles.defaultCard;
  let numberStyle: StyleProp<ViewStyle> = styles.rankNumberContainer;

  if (isUser) {
    cardStyle = styles.userCard;
    numberStyle = [styles.rankNumberContainer, styles.userRankNumber];
  } else if (rank === 1) {
    cardStyle = styles.goldCard;
    numberStyle = [styles.rankNumberContainer, styles.goldRankNumber];
  } else if (rank === 2) {
    cardStyle = styles.silverCard;
    numberStyle = [styles.rankNumberContainer, styles.silverRankNumber];
  } else if (rank === 3) {
    cardStyle = styles.bronzeCard;
    numberStyle = [styles.rankNumberContainer, styles.bronzeRankNumber];
  }

  return (
    <View style={[styles.rankCardBase, cardStyle]}>
      <View style={numberStyle}>
        <Text style={styles.rankNumber}>{rank}</Text>
      </View>
      <Text style={styles.rankName}>{name || 'Anonymous'}</Text>
      <View style={styles.scoreContainer}>
        <Qcoin width={24} height={24} />
        <Text style={styles.rankScore}>{score}</Text>
      </View>
    </View>
  );
};

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchLeaderboard = async () => {
        try {
          // 1. Get current user ID
          const { data: { session } } = await supabase.auth.getSession();
          setCurrentUser(session?.user?.id || null);

          // 2. Fetch top 10 profiles sorted by XP
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, xp')
            .order('xp', { ascending: false })
            .limit(10);

          if (error) throw error;
          setLeaders(data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#388e3c" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <WinMascot width={100} height={100} style={styles.mascot} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>TOP FARMERS</Text>
              <View style={styles.multiplierContainer}>
                <Coin width={24} height={24} style={styles.coinIcon} />
                <Text style={styles.multiplierText}>XP LEAGUE</Text>
              </View>
            </View>
          </View>

          <View style={styles.listContainer}>
            {leaders.map((user, index) => (
              <RankRow
                key={user.id}
                rank={index + 1}
                name={user.full_name}
                score={user.xp}
                isUser={user.id === currentUser}
              />
            ))}
            {leaders.length === 0 && <Text style={{color: 'white', textAlign:'center'}}>No players yet!</Text>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  mascot: { marginRight: 10 },
  headerText: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', fontFamily: PIXEL_FONT, letterSpacing: 1 },
  multiplierContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(253, 216, 53, 0.1)', borderColor: '#FDD835', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, alignSelf: 'flex-start' },
  coinIcon: { marginRight: 6 },
  multiplierText: { color: '#FDD835', fontSize: 18, fontWeight: 'bold', fontFamily: PIXEL_FONT },
  listContainer: { gap: 12 },
  rankCardBase: { flexDirection: 'row', alignItems: 'center', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 2, elevation: 10 },
  goldCard: { backgroundColor: '#544607', borderColor: '#FDD835' },
  silverCard: { backgroundColor: '#4E5357', borderColor: '#C0C0C0' },
  bronzeCard: { backgroundColor: '#5C3A21', borderColor: '#CD7F32' },
  userCard: { backgroundColor: '#1E3A5F', borderColor: '#0277BD' },
  defaultCard: { backgroundColor: '#333333', borderColor: '#424242' },
  rankNumberContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
  goldRankNumber: { backgroundColor: 'rgba(253, 216, 53, 0.2)', borderColor: 'rgba(253, 216, 53, 0.5)' },
  silverRankNumber: { backgroundColor: 'rgba(192, 192, 192, 0.2)', borderColor: 'rgba(192, 192, 192, 0.5)' },
  bronzeRankNumber: { backgroundColor: 'rgba(205, 127, 50, 0.2)', borderColor: 'rgba(205, 127, 50, 0.5)' },
  userRankNumber: { backgroundColor: 'rgba(2, 119, 189, 0.2)', borderColor: 'rgba(2, 119, 189, 0.5)' },
  rankNumber: { color: 'white', fontSize: 20, fontWeight: 'bold', fontFamily: PIXEL_FONT },
  rankName: { flex: 1, color: 'white', fontSize: 18, fontWeight: '500' },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  rankScore: { color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: PIXEL_FONT, marginLeft: 6 },
});