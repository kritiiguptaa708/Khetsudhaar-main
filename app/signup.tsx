import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View
} from 'react-native';
// Import AsyncStorage to retrieve guest progress
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/utils/supabase';
import UserIcon from '../assets/images/user.svg';

export default function SignupScreen() {
  const router = useRouter();
  const { t, isLoading: isTransLoading } = useTranslation();

  // --- Form State ---
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getEmailFromUsername = (usr: string) => {
    const cleanUser = usr.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanUser}@khet.com`;
  };

  const handleSignup = async () => {
    // 1. Validation
    if (!fullName.trim() || !username.trim() || !phone.trim() || !password || !confirmPassword) {
       Alert.alert('Missing Details', 'Please fill in all fields (Full Name, Username, Phone, Password).');
       return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }
    
    setIsLoading(true);

    const emailToRegister = getEmailFromUsername(username);

    // 2. Sign Up (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailToRegister,
      password: password,
    });

    if (authError) {
      Alert.alert('Signup Failed', authError.message);
      setIsLoading(false);
      return;
    }

    // --- CRITICAL CHECK: HANDLE EMAIL CONFIRMATION ---
    // If Supabase requires email confirmation, session will be null.
    if (!authData.session && authData.user) {
      setIsLoading(false);
      Alert.alert(
        'Check your Email',
        'Please confirm your email address to finish logging in.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
      return;
    }
    // -------------------------------------------------

    // 3. RETRIEVE ONBOARDING CHOICES
    let crop = 'FARMER';
    let lang = 'en';
    
    try {
      const storedCrop = await AsyncStorage.getItem('onboarding_crop');
      const storedLang = await AsyncStorage.getItem('onboarding_lang');
      
      if (storedCrop) crop = storedCrop;
      if (storedLang) lang = storedLang;
    } catch (e) {
      console.log('Error reading onboarding data:', e);
    }

    // 4. Create Profile & Save Progress
    if (authData.session?.user) {
        const userId = authData.session.user.id;

        // A. Save Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: fullName,          
                username: username,          
                mobile_no: phone,             
                selected_crop: crop,          
                language: lang,              
                coins: 1000, 
                xp: 100
            });
        
        if (profileError) {
            console.error('Profile creation error:', profileError);
            Alert.alert('Error', 'Account created but profile failed to save.');
        } else {
            // B. Mark Lesson 1 as Complete in DB
            const { error: lessonError } = await supabase.from('user_lessons').upsert({
                user_id: userId,
                lesson_id: 1, 
                completed_at: new Date().toISOString()
            });
            
            if (lessonError) console.error("Error saving lesson:", lessonError);

            // C. Clear onboarding flags
            await AsyncStorage.setItem('onboarding_reward_claimed', 'true');
        }
    }

    setIsLoading(false);
    
    // 5. Navigate to Lessons
    // Use replace to prevent going back to signup
    router.replace('/lessons');
  };

  if (isTransLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#388e3c" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('signup')}</Text>

        <View style={styles.avatarContainer}>
          <UserIcon width={80} height={80} />
        </View>

        <Text style={styles.inputLabel}>FULL NAME</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Enter your full name"
          placeholderTextColor="#777"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.inputLabel}>USERNAME</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Choose a username"
          placeholderTextColor="#777"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.inputLabel}>PHONE NUMBER</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Enter mobile number"
          placeholderTextColor="#777"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.inputLabel}>PASSWORD</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Create a password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Confirm your password"
          placeholderTextColor="#777"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[
            styles.actionButton,
            isLoading ? styles.actionButtonDisabled : styles.actionButtonActive,
          ]}
          disabled={isLoading}
          onPress={handleSignup}>
          <Text style={styles.actionButtonText}>
            {isLoading ? 'REGISTERING...' : 'REGISTER'}
          </Text>
        </TouchableOpacity>

        <View style={styles.accountLinkContainer}>
          <Text style={styles.accountLinkText}>{t('already_have_account')}</Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.loginHereText}>{t('login_here')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' }, 
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  container: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 40, paddingBottom: 50, alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginBottom: 20, letterSpacing: 1 },
  avatarContainer: { backgroundColor: '#1E1E1E', borderRadius: 50, padding: 15, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  inputLabel: { color: '#AAAAAA', fontSize: 12, fontWeight: '800', alignSelf: 'flex-start', marginBottom: 8, marginTop: 15, letterSpacing: 0.5 },
  input: { width: '100%', backgroundColor: '#1E1E1E', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#333333', color: '#FFFFFF', fontSize: 16 },
  actionButton: { width: '100%', paddingVertical: 16, borderRadius: 30, marginTop: 35 },
  actionButtonActive: { backgroundColor: '#388e3c' },
  actionButtonDisabled: { backgroundColor: '#333333' },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  accountLinkContainer: { flexDirection: 'row', marginTop: 25 },
  accountLinkText: { color: '#888888', fontSize: 14, marginRight: 5 },
  loginHereText: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold' },
});