import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";

// Assets
import Coin from "../assets/images/coin.svg";
import Qcoin from "../assets/images/Qcoin.svg";
import WinMascot from "../assets/images/winMascot.svg";

const PIXEL_FONT = Platform.OS === "ios" ? "System" : "Roboto";

const RankRow = ({
  rank,
  name,
  final_score,
  coins,
  quest_coins,
  multiplier,
  isUser = false,
}: any) => {
  let cardStyle: StyleProp<ViewStyle> = styles.defaultCard;
  let numberStyle: StyleProp<ViewStyle> = styles.rankNumberContainer;
  let rankTextColor = "white";

  if (isUser) {
    cardStyle = styles.userCard;
    numberStyle = [styles.rankNumberContainer, styles.userRankNumber];
  } else if (rank === 1) {
    cardStyle = styles.goldCard;
    numberStyle = [styles.rankNumberContainer, styles.goldRankNumber];
    rankTextColor = "#FFD700";
  } else if (rank === 2) {
    cardStyle = styles.silverCard;
    numberStyle = [styles.rankNumberContainer, styles.silverRankNumber];
    rankTextColor = "#C0C0C0";
  } else if (rank === 3) {
    cardStyle = styles.bronzeCard;
    numberStyle = [styles.rankNumberContainer, styles.bronzeRankNumber];
    rankTextColor = "#CD7F32";
  }

  return (
    <View style={[styles.rankCardBase, cardStyle]}>
      {/* Rank Number */}
      <View style={numberStyle}>
        <Text style={[styles.rankNumber, { color: rankTextColor }]}>
          {rank}
        </Text>
      </View>

      {/* Name and Breakdown */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={styles.rankName} numberOfLines={1}>
          {name || "Farmer"}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Coin width={12} height={12} />
            <Text style={styles.miniStatText}>{coins?.toLocaleString()}</Text>
          </View>
          <Text style={styles.divider}>•</Text>
          <View style={styles.miniStat}>
            <Qcoin width={12} height={12} />
            <Text style={styles.miniStatText}>
              {quest_coins?.toLocaleString()} QP
            </Text>
          </View>
          <Text style={styles.divider}>•</Text>
          <Text style={[styles.miniStatText, { color: "#E1BEE7" }]}>
            {multiplier?.toFixed(1)}x
          </Text>
        </View>
      </View>

      {/* Final Score */}
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.rankScore}>{final_score?.toLocaleString()}</Text>
      </View>
    </View>
  );
};

export default function LeaderboardScreen() {
  const { t, isLoading: isTransLoading } = useTranslation();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentId = session?.user?.id;

      const { data, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .order("final_score", { ascending: false })
        .limit(50);

      if (error) throw error;

      setLeaders(data || []);

      if (currentId) {
        let userEntry = data?.find((u) => u.id === currentId);

        if (!userEntry) {
          const { data: userData } = await supabase
            .from("leaderboard_view")
            .select("*")
            .eq("id", currentId)
            .single();
          userEntry = userData;
        }
        setCurrentUser(userEntry);
      }
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (loading || isTransLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388e3c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#388e3c"
          />
        }
      >
        {/* --- Header / My Stats --- */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <WinMascot width={80} height={80} style={styles.mascot} />
            <View>
              <Text style={styles.pageTitle}>{t("leaderboard")}</Text>
              <Text style={styles.pageSubtitle}>Ranked by Total Score</Text>
            </View>
          </View>

          {/* User Breakdown Card */}
          {currentUser && (
            <View style={styles.myStatsCard}>
              <Text style={styles.myStatsTitle}>MY SCORE BREAKDOWN</Text>

              <View style={styles.mathRow}>
                {/* Wealth */}
                <View style={styles.mathItem}>
                  <Text style={styles.mathLabel}>
                    {t("wealth") || "WEALTH"}
                  </Text>
                  <View style={styles.iconRow}>
                    <Coin width={16} height={16} />
                    <Text style={styles.mathValue}>
                      {currentUser.coins?.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.mathOperator}>×</Text>

                {/* Multiplier */}
                <View style={styles.mathItem}>
                  <Text style={styles.mathLabel}>
                    {t("multiplier") || "BOOST"}
                  </Text>
                  <View style={styles.iconRow}>
                    <Qcoin width={16} height={16} />
                    <Text style={[styles.mathValue, { color: "#E1BEE7" }]}>
                      {currentUser.multiplier?.toFixed(1)}x
                    </Text>
                  </View>
                </View>

                <Text style={styles.mathOperator}>=</Text>

                {/* Final Score */}
                <View style={styles.mathItem}>
                  <Text style={styles.mathLabel}>TOTAL</Text>
                  <Text
                    style={[
                      styles.mathValue,
                      { color: "#4CAF50", fontSize: 18 },
                    ]}
                  >
                    {currentUser.final_score?.toLocaleString()}
                  </Text>
                </View>
              </View>

              <Text style={styles.tipText}>
                Complete Quests to increase your Multiplier!
              </Text>
            </View>
          )}
        </View>

        {/* --- Leaderboard List --- */}
        <View style={styles.listContainer}>
          {leaders.map((user, index) => (
            <RankRow
              key={user.id}
              rank={index + 1}
              name={user.full_name}
              final_score={user.final_score}
              coins={user.coins}
              quest_coins={user.quest_coins}
              multiplier={user.multiplier}
              isUser={user.id === currentUser?.id}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { padding: 16, paddingBottom: 40 },

  // Header
  headerSection: { marginBottom: 24 },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  mascot: { marginRight: 15 },
  pageTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
  },
  pageSubtitle: { color: "#888", fontSize: 14 },

  // My Stats Card
  myStatsCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  myStatsTitle: {
    color: "#AAA",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  mathRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mathItem: { alignItems: "center" },
  mathLabel: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  mathValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
  },
  mathOperator: { color: "#444", fontSize: 18, fontWeight: "bold" },
  tipText: {
    color: "#E1BEE7",
    fontSize: 11,
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.8,
  },

  // List
  listContainer: { gap: 10 },

  // Rank Card Styles
  rankCardBase: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  defaultCard: {}, // <--- ADDED THIS TO FIX THE ERROR
  userCard: {
    backgroundColor: "rgba(56, 142, 60, 0.15)",
    borderColor: "#2E7D32",
    borderWidth: 2,
  },
  goldCard: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderColor: "#FFC107",
  },
  silverCard: {
    backgroundColor: "rgba(192, 192, 192, 0.1)",
    borderColor: "#BDBDBD",
  },
  bronzeCard: {
    backgroundColor: "rgba(205, 127, 50, 0.1)",
    borderColor: "#A1887F",
  },

  // Rank Number Circle
  rankNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goldRankNumber: { backgroundColor: "#FFC107" },
  silverRankNumber: { backgroundColor: "#BDBDBD" },
  bronzeRankNumber: { backgroundColor: "#A1887F" },
  userRankNumber: { backgroundColor: "#2E7D32" },

  rankNumber: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
  },

  // Rank Info
  rankName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },

  statsRow: { flexDirection: "row", alignItems: "center" },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  miniStatText: { color: "#AAA", fontSize: 12, fontWeight: "500" },
  divider: { color: "#444", marginHorizontal: 6, fontSize: 10 },

  // Score Badge
  scoreBadge: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 10,
  },
  scoreLabel: {
    color: "#666",
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
  },
  rankScore: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
  },
});
