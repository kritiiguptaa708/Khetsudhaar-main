import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";

// Assets
import UserIcon from "../assets/images/UserImage.svg";

const PIXEL_FONT = "monospace";

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // State for AgriStack
  const [agriStackId, setAgriStackId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [fetchedData, setFetchedData] = useState<any>(null);

  const fetchProfile = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Check if we already have AgriStack data stored (You can add these columns to Supabase later if you want)
    // For now we just use local state for the demo
    return data;
  };

  const {
    data: profile,
    refresh,
    refreshing,
  } = useCachedQuery("profile_data", fetchProfile);

  // --- MOCK AGRI-STACK VERIFICATION ---
  const handleVerifyAgriStack = () => {
    if (!agriStackId.trim()) {
      Alert.alert("Error", "Please enter a valid Farmer ID");
      return;
    }

    setIsVerifying(true);

    // SIMULATING API CALL TO GOVT SERVER
    setTimeout(() => {
      setIsVerifying(false);
      setIsLinked(true);

      // Mock Data returned from "Govt API"
      setFetchedData({
        landSize: "2.4 Hectares",
        location: "Madhya Pradesh, India",
        soilType: "Black Soil (Regur)",
        primaryCrop: "Wheat",
        kissanCardStatus: "Active",
      });

      Alert.alert(
        "Success",
        "AgriStack ID Linked Successfully! Data fetched from Government Records.",
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#388e3c"
          />
        }
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <UserIcon width={80} height={80} />
            <View style={styles.editIconBadge}>
              <FontAwesome5 name="camera" size={12} color="white" />
            </View>
          </View>
          <Text style={styles.userName}>{profile?.full_name || "Farmer"}</Text>
          <Text style={styles.userPhone}>
            {profile?.phone || "+91 98765 43210"}
          </Text>
        </View>

        {/* --- AGRI-STACK INTEGRATION CARD --- */}
        <View style={styles.agriStackCard}>
          <View style={styles.agriHeader}>
            <Text style={styles.agriTitle}>AGRISTACK INTEGRATION</Text>
            {isLinked && (
              <View style={styles.verifiedBadge}>
                <FontAwesome5 name="check-circle" size={12} color="white" />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}
          </View>

          <Text style={styles.agriDesc}>
            Link your Government Farmer ID (AgriStack) to fetch land records and
            get personalized schemes.
          </Text>

          {!isLinked ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter Farmer ID (e.g. AGRI-2025)"
                placeholderTextColor="#666"
                value={agriStackId}
                onChangeText={setAgriStackId}
              />
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerifyAgriStack}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.verifyBtnText}>LINK</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fetchedDataContainer}>
              <View style={styles.dataRow}>
                <FontAwesome5 name="map-marked-alt" size={14} color="#4CAF50" />
                <Text style={styles.dataText}>
                  Land: {fetchedData.landSize}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <FontAwesome5 name="layer-group" size={14} color="#4CAF50" />
                <Text style={styles.dataText}>
                  Soil: {fetchedData.soilType}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <FontAwesome5 name="seedling" size={14} color="#4CAF50" />
                <Text style={styles.dataText}>
                  Registered Crop: {fetchedData.primaryCrop}
                </Text>
              </View>
              <TouchableOpacity style={styles.viewDocBtn}>
                <Text style={styles.viewDocText}>VIEW LAND RECORD</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* --- MENU OPTIONS --- */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/crop")}
          >
            <View style={styles.menuIconBox}>
              <FontAwesome5 name="leaf" size={18} color="#4CAF50" />
            </View>
            <Text style={styles.menuText}>
              {t("change_crop") || "Change Crop"}
            </Text>
            <FontAwesome5 name="chevron-right" size={14} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <FontAwesome5 name="language" size={18} color="#2196F3" />
            </View>
            <Text style={styles.menuText}>
              {t("change_language") || "Change Language"}
            </Text>
            <FontAwesome5 name="chevron-right" size={14} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <FontAwesome5 name="cog" size={18} color="#9E9E9E" />
            </View>
            <Text style={styles.menuText}>{t("settings") || "Settings"}</Text>
            <FontAwesome5 name="chevron-right" size={14} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              ]}
            >
              <FontAwesome5 name="sign-out-alt" size={18} color="#F44336" />
            </View>
            <Text style={[styles.menuText, { color: "#F44336" }]}>
              {t("logout") || "Log Out"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>
          KhetSudhaar v1.0.0 (Hackathon Build)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContent: { paddingBottom: 50 },

  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  profileImageContainer: { position: "relative", marginBottom: 15 },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1E1E1E",
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: PIXEL_FONT,
  },
  userPhone: { color: "#888", fontSize: 14, marginTop: 4 },

  // AgriStack Card
  agriStackCard: {
    marginHorizontal: 20,
    backgroundColor: "#1E251E",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2E7D32",
    marginBottom: 20,
  },
  agriHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  agriTitle: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: { color: "white", fontSize: 10, fontWeight: "bold" },
  agriDesc: {
    color: "#B0BEC5",
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 18,
  },

  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#121212",
    borderRadius: 12,
    paddingHorizontal: 15,
    color: "white",
    height: 45,
    borderWidth: 1,
    borderColor: "#333",
  },
  verifyBtn: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyBtnText: { color: "white", fontWeight: "bold", fontSize: 12 },

  fetchedDataContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 15,
    borderRadius: 12,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  dataText: { color: "#E0E0E0", fontSize: 13, fontWeight: "500" },
  viewDocBtn: { marginTop: 10, alignItems: "center" },
  viewDocText: {
    color: "#4CAF50",
    fontSize: 10,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  // Menu
  menuContainer: { paddingHorizontal: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: { flex: 1, color: "white", fontSize: 16, fontWeight: "500" },

  versionText: {
    textAlign: "center",
    color: "#444",
    fontSize: 10,
    marginTop: 20,
  },
});
