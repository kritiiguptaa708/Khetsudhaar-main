import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";

import LeaderBoardIcon from "../assets/images/LeaderBoard.svg";
import Qcoin from "../assets/images/Qcoin.svg";

const PIXEL_FONT = "monospace";
const QUEST_REWARD = 1000; // Force Display 1000

const fetchQuestsData = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  // 1. Fetch Quests
  const { data: questsData, error: questError } = await supabase
    .from("quests")
    .select("*")
    .order("id");

  if (questError) throw questError;

  // 2. Fetch User Data
  let completedIds = new Set();
  let userRank = "-";
  let userCoins = 0;

  if (userId) {
    // Fetch Completed IDs
    const { data: userQuests } = await supabase
      .from("user_quests")
      .select("quest_id")
      .eq("user_id", userId);

    if (userQuests) {
      userQuests.forEach((uq) => completedIds.add(uq.quest_id));
    }

    // Fetch User Score
    const { data: profile } = await supabase
      .from("leaderboard_view")
      .select("quest_coins, final_score")
      .eq("id", userId)
      .maybeSingle();

    userCoins = profile?.quest_coins || 0;
    const finalScore = profile?.final_score || 0;

    // Fetch Rank
    const { count } = await supabase
      .from("leaderboard_view")
      .select("*", { count: "exact", head: true })
      .gt("final_score", finalScore);

    userRank = ((count || 0) + 1).toString();
  }

  const finalQuests = (questsData || []).map((q) => ({
    ...q,
    xp_reward: QUEST_REWARD, // FORCE 1000
    isCompleted: completedIds.has(q.id),
  }));

  return { quests: finalQuests, userRank, userCoins };
};

export default function QuestsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { data, loading, isOffline, refresh, refreshing } = useCachedQuery(
    "quests_page_v5_final",
    fetchQuestsData,
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  const quests = data?.quests || [];
  const userRank = data?.userRank || "-";
  const userCoins = data?.userCoins || 0;

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B1FA2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#7B1FA2"
          />
        }
      >
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <View style={styles.iconCircle}>
              <Qcoin width={20} height={20} />
            </View>
            <View>
              <Text style={styles.statLabel}>
                {t("quest_coins") || "QUEST POINTS"}
              </Text>
              <Text style={styles.statValue}>{userCoins}</Text>
            </View>
          </View>

          <View style={[styles.statPill, styles.rankPill]}>
            <View style={[styles.iconCircle, styles.iconCircleGold]}>
              <FontAwesome5 name="trophy" size={14} color="#FFD700" />
            </View>
            <View>
              <Text style={styles.statLabel}>
                {t("current_leaderboard_position") || "RANK"}
              </Text>
              <Text style={[styles.statValue, { color: "#FFD700" }]}>
                #{userRank}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.leaderboardBanner}
          onPress={() => router.push("/leaderboard")}
          activeOpacity={0.9}
        >
          <View style={styles.lbContent}>
            <Text style={styles.lbTitle}>LEADERBOARD</Text>
            <Text style={styles.lbDesc}>
              Your Rank:{" "}
              <Text style={{ fontWeight: "bold", color: "#FFD700" }}>
                #{userRank}
              </Text>
            </Text>
            <View style={styles.lbButton}>
              <Text style={styles.lbButtonText}>VIEW FULL RANKING</Text>
              <FontAwesome5 name="arrow-right" size={10} color="white" />
            </View>
          </View>
          <View style={styles.lbIconContainer}>
            <LeaderBoardIcon width={80} height={80} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          {t("monthly_quests") || "MONTHLY MISSIONS"}
        </Text>

        {quests.map((quest) => (
          <TouchableOpacity
            key={quest.id}
            style={[
              styles.questCard,
              quest.isCompleted
                ? styles.questCardCompleted
                : styles.questCardActive,
            ]}
            onPress={() => {
              if (!quest.isCompleted) {
                router.push({
                  pathname: "/quest-details",
                  params: { id: String(quest.id) },
                });
              }
            }}
            activeOpacity={0.8}
            disabled={quest.isCompleted} // <--- THIS LOCKS IT
          >
            <View
              style={[
                styles.decorBar,
                quest.isCompleted
                  ? styles.decorBarCompleted
                  : styles.decorBarActive,
              ]}
            />

            <View style={styles.cardInner}>
              <View style={styles.questHeader}>
                <Text
                  style={[
                    styles.questTitle,
                    quest.isCompleted && styles.textCompleted,
                  ]}
                >
                  {quest.title}
                </Text>
                {quest.isCompleted ? (
                  <View style={styles.statusBadgeDone}>
                    <FontAwesome5 name="check" size={10} color="white" />
                    <Text style={styles.statusTextDone}>DONE</Text>
                  </View>
                ) : (
                  <View style={styles.statusBadgeActive}>
                    <Text style={styles.statusTextActive}>ACTIVE</Text>
                  </View>
                )}
              </View>

              <Text style={styles.questDescription} numberOfLines={2}>
                {quest.description}
              </Text>

              <View style={styles.cardFooter}>
                {!quest.isCompleted && (
                  <View style={styles.rewardTag}>
                    <Qcoin width={14} height={14} />
                    <Text style={styles.rewardText}>+{quest.xp_reward} QP</Text>
                  </View>
                )}

                {!quest.isCompleted && (
                  <View style={styles.startBtn}>
                    <Text style={styles.startBtnText}>START</Text>
                    <FontAwesome5
                      name="chevron-right"
                      size={10}
                      color="#E0E0E0"
                    />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  scrollContent: { padding: 20, paddingBottom: 50 },
  offlineBanner: {
    backgroundColor: "#C62828",
    padding: 5,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  offlineText: { color: "white", fontWeight: "bold" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    gap: 12,
  },
  rankPill: {
    borderColor: "rgba(255, 215, 0, 0.3)",
    backgroundColor: "rgba(255, 215, 0, 0.05)",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleGold: { backgroundColor: "rgba(255, 215, 0, 0.1)" },
  statLabel: {
    color: "#888",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
    marginTop: 2,
  },
  leaderboardBanner: {
    backgroundColor: "#FF8F00",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#FF8F00",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  lbContent: { flex: 1, paddingRight: 10 },
  lbTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lbDesc: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 12 },
  lbButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  lbButtonText: { color: "white", fontSize: 10, fontWeight: "bold" },
  lbIconContainer: { justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  questCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    elevation: 4,
  },
  questCardActive: { borderColor: "#7B1FA2", backgroundColor: "#241a2e" },
  questCardCompleted: {
    borderColor: "#2E7D32",
    backgroundColor: "#1B3E20",
    opacity: 0.8,
  },
  decorBar: { width: 6, height: "100%" },
  decorBarActive: { backgroundColor: "#7B1FA2" },
  decorBarCompleted: { backgroundColor: "#4CAF50" },
  cardInner: { flex: 1, padding: 16 },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  questTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  textCompleted: { color: "#A5D6A7", textDecorationLine: "line-through" },
  statusBadgeActive: {
    backgroundColor: "rgba(123, 31, 162, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#7B1FA2",
  },
  statusTextActive: { color: "#E1BEE7", fontSize: 10, fontWeight: "bold" },
  statusBadgeDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTextDone: { color: "white", fontSize: 10, fontWeight: "bold" },
  questDescription: {
    color: "#B0B0B0",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rewardText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
  },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  startBtnText: {
    color: "#E0E0E0",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
