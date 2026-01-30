import { FontAwesome5 } from "@expo/vector-icons"; // Ensure this is imported
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
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

// Assets
import Coin from "../assets/images/coin.svg";
import LeaderBoard from "../assets/images/LeaderBoard.svg";
import Lessons from "../assets/images/Lessons.svg";
import MarketPrice from "../assets/images/market-price.svg";
import MascotFarmer from "../assets/images/MascotFarmer.svg";
import Quest from "../assets/images/Quest.svg";
import Reward from "../assets/images/Reward.svg";

const PIXEL_FONT = "monospace";

// --- TYPES ---
interface QuestDetail {
  id: number;
  title: string;
  description: string;
}

interface LessonDetail {
  id: number;
  title: string;
  description: string;
  sequence: number;
}

interface ActiveQuestData {
  status: string;
  quest: QuestDetail | null;
}

type UserProgress = {
  total_lessons: number;
  completed_lessons: number;
  user_coins: number;
  user_name: string;
  active_quest: QuestDetail | null;
  next_lesson: LessonDetail | null;
};

// --- DATA FETCHERS ---
const fetchUserProgress = async (): Promise<UserProgress> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  if (!userId)
    return {
      total_lessons: 0,
      completed_lessons: 0,
      user_coins: 0,
      user_name: "FARMER",
      active_quest: null,
      next_lesson: null,
    };

  // 1. Profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("coins, full_name")
    .eq("id", userId)
    .single();

  const user_coins = profileData?.coins || 0;
  const user_name = profileData?.full_name || "FARMER";

  // 2. Lessons Counts & Next Lesson Logic
  const { count: total_lessons } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true });

  const { data: userLessons } = await supabase
    .from("user_lessons")
    .select("lesson_id")
    .eq("user_id", userId);

  const completedIds = userLessons?.map((ul) => ul.lesson_id) || [];
  const completed_lessons = completedIds.length;

  let nextLessonData: LessonDetail | null = null;
  let maxSeq = 0;

  if (completedIds.length > 0) {
    const { data: completedSeqsData } = await supabase
      .from("lessons")
      .select("sequence")
      .in("id", completedIds);

    if (completedSeqsData) {
      maxSeq = completedSeqsData.reduce(
        (max, current) => Math.max(max, current.sequence),
        0,
      );
    }
  }

  const { data: next } = await supabase
    .from("lessons")
    .select("id, title_en, description_en, sequence")
    .gt("sequence", maxSeq)
    .order("sequence", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (next) {
    nextLessonData = {
      id: next.id,
      title: next.title_en || "Next Lesson",
      description: next.description_en || "Continue your journey.",
      sequence: next.sequence,
    };
  } else if (completed_lessons === 0) {
    const { data: first } = await supabase
      .from("lessons")
      .select("id, title_en, description_en, sequence")
      .eq("sequence", 1)
      .maybeSingle();

    if (first) {
      nextLessonData = {
        id: first.id,
        title: first.title_en,
        description: first.description_en,
        sequence: first.sequence,
      };
    }
  }

  // 3. Active Quest
  let active_quest: QuestDetail | null = null;
  const { data: userQuests } = (await supabase
    .from("user_quests")
    .select("status, quest:quests(id, title, description)")) as {
    data: ActiveQuestData[] | null;
  };

  if (userQuests && userQuests.length > 0) {
    active_quest = userQuests[0].quest;
  }

  return {
    total_lessons: total_lessons || 0,
    completed_lessons: completed_lessons || 0,
    user_coins,
    user_name,
    active_quest,
    next_lesson: nextLessonData,
  };
};

// --- COMPONENTS ---
const Header = ({ coins, name }: { coins: number; name: string }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerGreeting}>WELCOME BACK,</Text>
      <Text style={styles.headerName}>
        {name ? name.toUpperCase() : "FARMER"}
      </Text>
    </View>
    <View style={styles.coinPill}>
      <Coin width={20} height={20} />
      <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
    </View>
  </View>
);

const HubButton = ({ icon, label, onPress, style, textStyle }: any) => (
  <TouchableOpacity style={[styles.buttonBase, style]} onPress={onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={[styles.buttonText, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

// --- MAIN SCREEN ---
export default function DashboardScreen() {
  const router = useRouter();
  const { t, isLoading: isTransLoading } = useTranslation();

  const {
    data: progressData,
    loading: progressLoading,
    refresh: refreshProgress,
    refreshing,
  } = useCachedQuery(`dashboard_progress_v4`, fetchUserProgress);

  const handleRefresh = async () => {
    await refreshProgress();
  };

  if ((progressLoading || isTransLoading) && !progressData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  const completed = progressData?.completed_lessons || 0;
  const total = progressData?.total_lessons || 0;
  const nextLesson = progressData?.next_lesson;
  const activeQuest = progressData?.active_quest;
  const coins = progressData?.user_coins || 0;
  const userName = progressData?.user_name || "FARMER";

  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Header coins={coins} name={userName} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#388e3c"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <View style={styles.heroContainer}>
          <MascotFarmer width={110} height={110} style={styles.mascot} />

          {nextLesson ? (
            <TouchableOpacity
              style={[styles.heroCard, styles.lessonHeroCard]}
              onPress={() =>
                router.push({
                  pathname: "/lesson/[id]",
                  params: { id: nextLesson.id.toString() },
                })
              }
            >
              <View style={[styles.heroBadge, { backgroundColor: "#388e3c" }]}>
                <Text style={styles.heroBadgeText}>CONTINUE LEARNING</Text>
              </View>
              <View style={styles.heroContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>
                    LESSON {nextLesson.sequence}
                  </Text>
                  <Text style={styles.heroDesc} numberOfLines={2}>
                    {nextLesson.title}
                  </Text>
                </View>
                <Lessons width={40} height={40} />
              </View>
            </TouchableOpacity>
          ) : activeQuest ? (
            <TouchableOpacity
              style={[styles.heroCard, styles.questCard]}
              onPress={() =>
                router.push({
                  pathname: "/quest-details",
                  params: { id: activeQuest.id.toString() },
                })
              }
            >
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>ACTIVE MISSION</Text>
              </View>
              <View style={styles.heroContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>{activeQuest.title}</Text>
                  <Text style={styles.heroDesc} numberOfLines={2}>
                    {activeQuest.description}
                  </Text>
                </View>
                <Quest width={40} height={40} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.heroCard, { backgroundColor: "#333" }]}>
              <Text style={styles.heroTitle}>ALL CAUGHT UP!</Text>
              <Text style={styles.heroDesc}>
                You have completed all lessons.
              </Text>
            </View>
          )}
        </View>

        {/* PROGRESS BAR */}
        <View style={styles.progressSection}>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {completed} / {total} LESSONS COMPLETED
          </Text>
        </View>

        {/* HUB GRID */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <HubButton
              label={t("monthly_quests")}
              icon={<Quest width={60} height={60} />}
              onPress={() => router.push("/quests")}
              style={[styles.buttonSquare, styles.questsButton]}
              textStyle={styles.squareButtonText}
            />
            <HubButton
              label={t("leaderboard")}
              icon={<LeaderBoard width={60} height={60} />}
              onPress={() => router.push("/leaderboard")}
              style={[styles.buttonSquare, styles.leaderboardButton]}
              textStyle={styles.squareButtonText}
            />
          </View>

          {/* --- MISSING BUTTON ADDED HERE --- */}
          <View style={styles.gridRow}>
            <HubButton
              label={t("schemes_title") || "Govt Schemes"}
              icon={<FontAwesome5 name="university" size={40} color="white" />}
              onPress={() => router.push("/schemes/index" as any)}
              style={[
                styles.buttonRect,
                {
                  backgroundColor: "rgba(33, 150, 243, 0.3)", // Blue background
                  borderColor: "#2196F3",
                },
              ]}
              textStyle={styles.rectButtonText}
            />
          </View>

          <View style={styles.gridRow}>
            <HubButton
              label={t("rewards")}
              icon={<Reward width={50} height={50} />}
              onPress={() => router.push("/reward-root")}
              style={[styles.buttonRect, styles.rewardsButton]}
              textStyle={styles.rectButtonText}
            />
          </View>

          <View style={styles.gridRow}>
            <HubButton
              label={t("lessons")}
              icon={<Lessons width={50} height={50} />}
              onPress={() =>
                router.push({
                  pathname: "/lessons",
                  params: { lesson_completed: "0" },
                })
              }
              style={[styles.buttonRect, styles.lessonsButton]}
              textStyle={styles.rectButtonText}
            />
          </View>

          <View style={styles.gridRow}>
            <HubButton
              label={t("market_prices")}
              icon={<MarketPrice width={50} height={50} />}
              onPress={() => router.push("/marketPrices")}
              style={[styles.buttonRect, styles.marketButton]}
              textStyle={styles.rectButtonText}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#121212",
  },
  headerGreeting: {
    color: "#888",
    fontSize: 10,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
  },
  headerName: {
    color: "white",
    fontSize: 22,
    fontFamily: PIXEL_FONT,
    fontWeight: "bold",
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  coinText: {
    color: "#FFD700",
    marginLeft: 8,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
  },

  scrollContainer: { paddingHorizontal: 20, paddingBottom: 50 },

  heroContainer: { marginBottom: 20, marginTop: 10 },
  mascot: { position: "absolute", right: 10, top: -25, zIndex: 10 },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  questCard: {
    backgroundColor: "#2E1A47",
    borderColor: "#7B1FA2",
    shadowColor: "#7B1FA2",
  },
  lessonHeroCard: {
    backgroundColor: "#1B3E20",
    borderColor: "#388E3C",
    shadowColor: "#388E3C",
  },

  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  heroBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 80,
  },
  heroTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    lineHeight: 24,
  },
  heroDesc: { color: "#CCC", fontSize: 12 },

  progressSection: { marginBottom: 20 },
  progressBg: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", backgroundColor: "#4CAF50", borderRadius: 4 },
  progressText: {
    color: "#888",
    fontSize: 10,
    fontFamily: PIXEL_FONT,
    textAlign: "center",
  },

  gridContainer: { width: "100%" },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  buttonBase: {
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  buttonSquare: { flex: 1, aspectRatio: 1, marginHorizontal: 5 },
  buttonRect: {
    flex: 1,
    height: 100,
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 30,
  },

  iconContainer: { marginBottom: 10 },
  buttonText: { color: "white", fontWeight: "bold", fontFamily: PIXEL_FONT },
  squareButtonText: { fontSize: 14, textAlign: "center", marginTop: 5 },
  rectButtonText: { fontSize: 18, marginLeft: 20 },

  questsButton: {
    backgroundColor: "rgba(74, 20, 140, 0.4)",
    borderColor: "#7B1FA2",
  },
  leaderboardButton: {
    backgroundColor: "rgba(255, 143, 0, 0.25)",
    borderColor: "#FF8F00",
  },
  rewardsButton: {
    backgroundColor: "rgba(194, 24, 91, 0.4)",
    borderColor: "#E91E63",
  },
  lessonsButton: {
    backgroundColor: "rgba(56, 142, 60, 0.4)",
    borderColor: "#43A047",
  },
  marketButton: {
    backgroundColor: "rgba(2, 119, 189, 0.4)",
    borderColor: "#039BE5",
  },
});
