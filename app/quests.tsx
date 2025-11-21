import { supabase } from '@/utils/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Assets from your repo
import Qcoin from '../assets/images/Qcoin.svg';
import Checkmark from '../assets/images/check.svg';

const PIXEL_FONT = 'monospace';

const QuestItem = ({
  title,
  subtitle,
  description,
  points,
  isCompleted,
  onPress,
}: {
  title: string;
  subtitle: string | null;
  description: string | null;
  points: number;
  isCompleted: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.questCard, isCompleted && styles.questCardCompleted]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.questTextContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.questTitle}>{title}</Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Checkmark width={12} height={12} />
            <Text style={styles.completedText}>DONE</Text>
          </View>
        )}
      </View>
      {subtitle ? <Text style={styles.questSubtitle}>{subtitle}</Text> : null}
      <Text style={styles.questDescription} numberOfLines={2}>{description}</Text>
    </View>
    
    <View style={styles.questReward}>
      <Qcoin width={32} height={32} />
      <Text style={[styles.questRewardText, isCompleted && styles.questRewardTextCompleted]}>
        {points}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function QuestsScreen() {
  const router = useRouter();
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | string>('-');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      // 1. Fetch Quests
      const { data: questsData, error: questError } = await supabase
        .from('quests')
        .select('*')
        .order('id');

      if (questError) throw questError;

      // 2. Fetch Completed Status
      const { data: userQuests, error: uqError } = await supabase
        .from('user_quests')
        .select('quest_id')
        .eq('user_id', userId);

      if (uqError) throw uqError;

      const completedIds = new Set(userQuests?.map(uq => uq.quest_id));

      setQuests((questsData || []).map(q => ({
        ...q,
        isCompleted: completedIds.has(q.id)
      })));

      // 3. Get Rank (Simple Client-Side Sort)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, xp')
        .order('xp', { ascending: false });

      if (profiles) {
        const rank = profiles.findIndex(p => p.id === userId) + 1;
        setUserRank(rank > 0 ? rank : '-');
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#388E3C" /></View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#388E3C"/>}
        >
          <Text style={styles.mainTitle}>MONTHLY QUESTS</Text>

          {quests.map((quest) => (
            <QuestItem
              key={quest.id}
              title={quest.title}
              subtitle={quest.subtitle}
              description={quest.description}
              points={quest.xp_reward}
              isCompleted={quest.isCompleted}
              onPress={() => router.push({ pathname: '/quest-details', params: { id: quest.id } })}
            />
          ))}

          {/* Leaderboard Widget */}
          <View style={styles.leaderboardContainer}>
            <View>
              <Text style={styles.leaderboardLabel}>CURRENT</Text>
              <Text style={styles.leaderboardLabel}>LEADERBOARD</Text>
              <Text style={styles.leaderboardLabel}>POSITION</Text>
            </View>
            <View style={styles.leaderboardRankBox}>
              <Text style={styles.leaderboardRank}>{userRank}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  mainTitle: { color: 'white', fontFamily: PIXEL_FONT, fontSize: 18, textAlign: 'center', marginTop: 10, marginBottom: 24, fontWeight: 'bold', letterSpacing: 1 },
  
  // Quest Card
  questCard: { backgroundColor: '#2C2C2E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#424242', flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  questCardCompleted: { backgroundColor: '#1E281E', borderColor: '#2E7D32', opacity: 0.8 },
  questTextContainer: { flex: 1, marginRight: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  questTitle: { color: 'white', fontFamily: PIXEL_FONT, fontSize: 16, fontWeight: 'bold', flex: 1, flexWrap: 'wrap' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#388E3C', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  completedText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4, fontFamily: PIXEL_FONT },
  questSubtitle: { color: '#A5D6A7', fontFamily: PIXEL_FONT, fontSize: 12, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase' },
  questDescription: { color: '#BDBDBD', fontSize: 12, lineHeight: 18 },
  questReward: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 12, minWidth: 60 },
  questRewardText: { color: '#FFD700', fontFamily: PIXEL_FONT, fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  questRewardTextCompleted: { color: '#4CAF50' },

  // Leaderboard Widget
  leaderboardContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, backgroundColor: '#2C2C2E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#424242' },
  leaderboardLabel: { color: '#E0E0E0', fontFamily: PIXEL_FONT, fontSize: 16, lineHeight: 24, fontWeight: 'bold' },
  leaderboardRankBox: { backgroundColor: '#151718', borderRadius: 16, borderWidth: 2, borderColor: '#388E3C', width: 90, height: 90, alignItems: 'center', justifyContent: 'center', shadowColor: '#388E3C', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  leaderboardRank: { color: 'white', fontFamily: PIXEL_FONT, fontSize: 48, fontWeight: 'bold' },
});