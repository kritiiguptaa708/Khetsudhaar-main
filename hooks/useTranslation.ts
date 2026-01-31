import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import translations, {
  DEFAULT_LANGUAGE,
  TranslationKeys,
} from "@/constants/translations";
import { supabase } from "@/utils/supabase";

const LANGUAGE_STORAGE_KEY = "@user_language";

export const useTranslation = () => {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLanguage = useCallback(async () => {
    let userLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (!userLang) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("language")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!error && profile?.language) {
            userLang = profile.language;
          }
        }
      } catch (e) {
        console.warn("Could not fetch profile language:", e);
      }
    }

    const finalLanguage =
      userLang && translations[userLang] ? userLang : DEFAULT_LANGUAGE;
    setLanguageState(finalLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, finalLanguage);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLanguage();
    }, [fetchLanguage]),
  );

  const t = useCallback(
    (key: TranslationKeys): string => {
      const langStrings = translations[language];
      if (langStrings && langStrings[key]) {
        return langStrings[key];
      }

      const defaultStrings = translations[DEFAULT_LANGUAGE];
      if (defaultStrings && defaultStrings[key]) {
        return defaultStrings[key];
      }

      return key;
    },
    [language],
  );

  const setLanguage = async (newLang: string) => {
    setLanguageState(newLang);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
  };

  return { t, language, isLoading, setLanguage };
};
