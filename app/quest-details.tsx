import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { supabase } from "@/utils/supabase";
import Qcoin from "../assets/images/Qcoin.svg";

export default function QuestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuest = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setQuest(data);
      }
      setLoading(false);
    };
    fetchQuest();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B1FA2" />
      </View>
    );
  }

  if (!quest) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 50 }}>
          Quest not found.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Header / Back Button --- */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>

        {/* --- Hero Image / Icon --- */}
        <View style={styles.heroSection}>
          <View style={styles.iconRing}>
            <FontAwesome5
              name={quest.icon_type || "scroll"}
              size={50}
              color="#E1BEE7"
            />
          </View>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questSubtitle}>
            {quest.subtitle || "Mission Briefing"}
          </Text>
        </View>

        {/* --- Reward Card --- */}
        <View style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>COMPLETION REWARD</Text>
          <View style={styles.rewardRow}>
            <Qcoin width={40} height={40} />
            <Text style={styles.rewardValue}>+{quest.xp_reward} QP</Text>
          </View>
        </View>

        {/* --- Description --- */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>MISSION DETAILS</Text>
          <Text style={styles.description}>{quest.description}</Text>
        </View>
      </ScrollView>

      {/* --- Footer Button --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            router.push({ pathname: "/quest-quiz", params: { id: quest.id } })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>START MISSION</Text>
          <FontAwesome5 name="play" size={14} color="white" />
        </TouchableOpacity>
      </View>
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
  scrollContent: { padding: 24, paddingBottom: 100 },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  heroSection: { alignItems: "center", marginTop: 20, marginBottom: 40 },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(123, 31, 162, 0.2)",
    borderWidth: 2,
    borderColor: "#7B1FA2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#7B1FA2",
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  questTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  questSubtitle: {
    color: "#B39DDB",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "600",
  },

  rewardCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 30,
  },
  rewardLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 1,
  },
  rewardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rewardValue: {
    color: "#FFD700",
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "monospace",
  },

  infoSection: { marginBottom: 20 },
  sectionHeader: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 1,
  },
  description: { color: "#E0E0E0", fontSize: 16, lineHeight: 26 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  startButton: {
    backgroundColor: "#7B1FA2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    elevation: 5,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
