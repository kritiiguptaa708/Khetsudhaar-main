import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";

// --- FULL LIST OF 9 LANGUAGES ---
const LANGUAGES = [
  { id: "en", name: "English", native: "English" },
  { id: "hi", name: "Hindi", native: "हिन्दी" },
  { id: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { id: "ml", name: "Malayalam", native: "മലയാളം" },
  // Locked
  { id: "ta", name: "Tamil", native: "தமிழ்" },
  { id: "te", name: "Telugu", native: "తెలుగు" },
  { id: "mr", name: "Marathi", native: "मराठी" },
  { id: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { id: "kn", name: "Kannada", native: "कन्नड़" },
];

const SUPPORTED_IDS = ["en", "hi", "pa", "ml"];

export default function LanguageScreen() {
  const router = useRouter();
  const { t, setLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (langId: string) => {
    setSelectedLanguage(langId);
    setLanguage(langId);
  };

  const handleContinue = async () => {
    if (!selectedLanguage) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ language: selectedLanguage })
          .eq("id", userId);

        // CHECK IF CROP EXISTS (Prevent Loop)
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_crop")
          .eq("id", userId)
          .single();

        if (profile?.selected_crop) {
          router.replace("/dashboard"); // Existing user -> Home
        } else {
          router.replace("/crop"); // New user -> Crop
        }
      } else {
        router.replace("/crop");
      }
    } catch (error) {
      console.error("Error updating language:", error);
      router.replace("/crop");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("choose_language")}</Text>
        <Text style={styles.subtitle}>
          {t("choose_your_language_in_hindi")}
        </Text>

        <ScrollView
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            const isSupported = SUPPORTED_IDS.includes(lang.id);

            return (
              <TouchableOpacity
                key={lang.id}
                disabled={!isSupported}
                style={[
                  styles.langButton,
                  isSelected && styles.langButtonSelected,
                  !isSupported && styles.langButtonDisabled,
                ]}
                onPress={() => handleLanguageSelect(lang.id)}
                activeOpacity={0.8}
              >
                <View style={styles.row}>
                  <Text
                    style={[
                      styles.langText,
                      isSelected && { color: "white", fontWeight: "bold" }, // White on Select
                      !isSupported && { color: "#666" }, // Grey if locked
                    ]}
                  >
                    {lang.native}{" "}
                    <Text
                      style={{
                        fontSize: 14,
                        color: isSelected ? "#DDD" : "#888",
                      }}
                    >
                      ({lang.name})
                    </Text>
                  </Text>

                  {/* Lock Icon */}
                  {!isSupported && (
                    <FontAwesome5
                      name="lock"
                      size={14}
                      color="#555"
                      style={{ marginLeft: 10 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedLanguage
                ? styles.confirmButtonActive
                : styles.confirmButtonDisabled,
            ]}
            disabled={!selectedLanguage}
            onPress={handleContinue}
          >
            <Text style={styles.confirmButtonText}>{t("confirm")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#151718" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#B0B0B0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  scrollList: { paddingBottom: 100 },

  // ORIGINAL TILE STYLE
  langButton: {
    backgroundColor: "#333333", // Solid Grey
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333333", // Border matches BG
    marginBottom: 12,
  },
  langButtonSelected: {
    borderColor: "#388e3c", // Only Border Green
    backgroundColor: "#333333", // BG stays same
  },
  langButtonDisabled: {
    opacity: 0.5,
    borderColor: "#333333",
  },

  row: { flexDirection: "row", alignItems: "center" },
  langText: { color: "#B0B0B0", fontSize: 18, fontWeight: "500" }, // Default Grey Text

  footer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#151718",
  },
  confirmButton: { width: "100%", paddingVertical: 16, borderRadius: 30 },
  confirmButtonDisabled: { backgroundColor: "#555555" },
  confirmButtonActive: { backgroundColor: "#388e3c" },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
