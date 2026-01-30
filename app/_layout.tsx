import { FontAwesome5 } from "@expo/vector-icons";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";

function AppHeaderLeft() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/profile")}>
      <FontAwesome5
        name="user-circle"
        size={28}
        color="white"
        style={styles.profileIcon}
      />
    </TouchableOpacity>
  );
}

function AppHeaderRight() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/dashboard")}>
      <Image
        source={require("../assets/images/Applogo.png")}
        style={styles.logoRight}
      />
    </TouchableOpacity>
  );
}

export default function AppLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { t, isLoading: isTransLoading } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- AUTH GUARD LOGIC ---
  useEffect(() => {
    if (isLoading) return;

    const currentRoute = (segments[0] || "index") as string;

    const publicRoutes = [
      "index",
      "language",
      "crop",
      "login",
      "signup",
      "lessons",
      "lesson",
      "quiz",
      "complete",
      "reward",
    ];

    const isPublicRoute = publicRoutes.includes(currentRoute);

    if (session) {
      if (
        currentRoute === "login" ||
        currentRoute === "signup" ||
        currentRoute === "index"
      ) {
        router.replace("/dashboard");
      }
    } else {
      if (!isPublicRoute) {
        router.replace("/login");
      }
    }
  }, [session, isLoading, segments]);

  if (isLoading || isTransLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#388e3c" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#388e3c" },
          headerTintColor: "#fff",
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {/* Public Screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="language"
          options={{
            headerShown: true,
            headerTitle: t("choose_language"),
            headerLeft: () => null,
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="crop"
          options={{
            headerShown: true,
            headerTitle: t("choose_crop"),
            headerLeft: () => null,
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: true,
            headerTitle: t("login"),
            headerLeft: () => null,
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: true,
            headerTitle: t("signup"),
            headerLeft: () => null,
            headerRight: () => <AppHeaderRight />,
          }}
        />

        <Stack.Screen
          name="lessons"
          options={{
            headerShown: true,
            headerTitle: t("lessons"),
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="reward-root"
          options={{
            headerShown: true,
            headerTitle: t("rewards_tree_title"),
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{
            headerShown: true,
            headerTitle: t("leaderboard"),
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="quests"
          options={{
            headerShown: true,
            headerTitle: t("monthly_quests"),
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="marketPrices"
          options={{
            headerShown: true,
            headerTitle: t("market_prices"),
            headerRight: () => <AppHeaderRight />,
          }}
        />

        {/* --- SCHEMES ADDED HERE --- */}
        <Stack.Screen
          name="schemes/index"
          options={{
            headerShown: true,
            headerTitle: t("schemes_title") || "Govt Schemes",
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="schemes/[id]"
          options={{
            headerShown: true,
            headerTitle: "SCHEME DETAIL",
            headerRight: () => <AppHeaderRight />,
          }}
        />

        {/* Lesson Flow */}
        <Stack.Screen
          name="lesson/[id]"
          options={{
            headerShown: true,
            headerTitle: "LESSON DETAIL",
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen name="game/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="quiz/[id]"
          options={{
            headerShown: true,
            headerTitle: t("take_quiz"),
            headerLeft: () => null,
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="complete/[id]"
          options={{
            headerShown: true,
            headerTitle: t("completed"),
            headerLeft: () => null,
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="reward/[id]"
          options={{
            headerShown: true,
            headerTitle: t("rewards"),
            headerLeft: () => null,
            headerRight: () => <AppHeaderRight />,
          }}
        />

        {/* Protected Root Screens (Keep Profile Icon Here) */}
        <Stack.Screen
          name="dashboard"
          options={{
            headerShown: true,
            headerTitle: t("dashboard"),
            headerLeft: () => <AppHeaderLeft />,
            headerRight: () => <AppHeaderRight />,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            headerTitle: t("profile"),
            headerLeft: () => <AppHeaderLeft />,
            headerRight: () => <AppHeaderRight />,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  logoRight: { width: 40, height: 40, marginRight: 15 },
  profileIcon: { marginLeft: 15 },
});

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151718",
  },
});
