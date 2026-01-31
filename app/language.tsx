import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- YOUR ORIGINAL LIST (with locked status added) ---
const LANGUAGES = [
  { id: "hi", name: "हिन्दी/HINDI", isSupported: true },
  { id: "en", name: "ENGLISH", isSupported: true },
  { id: "pa", name: "ਪੰਜਾਬੀ/PUNJABI", isSupported: true },
  { id: "ml", name: "മലയാളം/MALAYALAM", isSupported: true },
  { id: "ta", name: "தமிழ்/TAMIL", isSupported: false },
  { id: "kn", name: "ಕನ್ನಡ/KANNADA", isSupported: false },
  { id: "te", name: "తెలుగు/TELUGU", isSupported: false },
  { id: "kok", name: "कोंकणी/KONKANI", isSupported: false },
  { id: "mr", name: "मराठी/MARATHI", isSupported: false },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t, setLanguage, isLoading: isTransLoading } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (selectedLanguage) {
      try {
        // 1. Update language
        setLanguage(selectedLanguage);
        await AsyncStorage.setItem("onboarding_lang", selectedLanguage);

        // 2. Save to DB if logged in
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from("profiles")
            .update({ language: selectedLanguage })
            .eq("id", session.user.id);

          // 3. SMART NAVIGATION (Prevent Loop)
          const { data: profile } = await supabase
            .from("profiles")
            .select("selected_crop")
            .eq("id", session.user.id)
            .single();

          if (profile?.selected_crop) {
            router.replace("/dashboard"); // Go Home if crop exists
          } else {
            router.replace("/crop"); // Go to Crop if new
          }
        } else {
          router.replace("/crop");
        }
      } catch (error) {
        console.error("Error saving language:", error);
        router.replace("/crop");
      }
    }
  };

  if (isTransLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388e3c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("choose_language")}</Text>
        <Text style={styles.subtitle}>
          {t("choose_your_language_in_hindi")}
        </Text>

        <View style={styles.listContainer}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              disabled={!lang.isSupported} // <--- Disable locked langs
              style={[
                styles.languageButton,
                selectedLanguage === lang.id && styles.languageButtonSelected,
                !lang.isSupported && styles.languageButtonDisabled, // <--- Dim locked langs
              ]}
              onPress={() => setSelectedLanguage(lang.id)}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  !lang.isSupported && { color: "#666" }, // Grey text for locked
                ]}
              >
                {lang.name}
              </Text>

              {/* Optional Lock Icon (Subtle) */}
              {!lang.isSupported && (
                <FontAwesome5
                  name="lock"
                  size={14}
                  color="#666"
                  style={{ position: "absolute", right: 20 }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.confirmButton,
            selectedLanguage
              ? styles.confirmButtonActive
              : styles.confirmButtonDisabled,
          ]}
          disabled={!selectedLanguage}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>{t("confirm")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- YOUR ORIGINAL STYLING (Unchanged) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#151718" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151718",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#B0B0B0",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: { width: "100%", maxWidth: 400 },

  languageButton: {
    backgroundColor: "#333333",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: "#555555",
    justifyContent: "center", // Added to center text/icon
  },
  languageButtonSelected: {
    backgroundColor: "#388e3c",
    borderColor: "#388e3c",
  },
  languageButtonDisabled: {
    // Added for locked state
    opacity: 0.5,
    backgroundColor: "#252525",
    borderColor: "#333",
  },

  languageButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },

  confirmButton: {
    width: "100%",
    maxWidth: 400,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 20,
  },
  confirmButtonDisabled: { backgroundColor: "#555555" },
  confirmButtonActive: { backgroundColor: "#388e3c" },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
