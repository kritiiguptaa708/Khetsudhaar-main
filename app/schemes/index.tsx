import { GOV_SCHEMES } from "@/constants/schemes";
import { useTranslation } from "@/hooks/useTranslation";
import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SchemesListScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isHindi = language === "hi";

  const renderItem = ({ item }: { item: (typeof GOV_SCHEMES)[0] }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: item.color }]}
      onPress={() =>
        router.push({ pathname: "/schemes/[id]", params: { id: item.id } })
      }
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <FontAwesome5 name={item.icon as any} size={24} color="white" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {isHindi ? item.title_hi : item.title_en}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {isHindi ? item.desc_hi : item.desc_en}
        </Text>
        <View style={styles.ctaRow}>
          <Text style={[styles.ctaText, { color: item.color }]}>
            {t("view_details") || "View Details"}
          </Text>
          <FontAwesome5 name="arrow-right" size={12} color={item.color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: t("schemes_title") || "Govt Schemes" }} />

      <View style={styles.header}>
        <Text style={styles.subHeader}>
          {t("schemes_subtitle") || "Empowering Farmers"}
        </Text>
      </View>

      <FlatList
        data={GOV_SCHEMES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { padding: 20, paddingBottom: 10 },
  subHeader: {
    color: "#aaa",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  listContent: { padding: 15 },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderLeftWidth: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDesc: { color: "#bbb", fontSize: 12, lineHeight: 18, marginBottom: 10 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ctaText: { fontSize: 12, fontWeight: "bold" },
});
