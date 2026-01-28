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

import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/utils/supabase';
import UserIcon from '../assets/images/user.svg';

export default function SignupScreen() {
  const router = useRouter();
  const { t, isLoading: isTransLoading } = useTranslation();

  // --- Form State ---
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [agristackId, setAgristackId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- EMAIL GENERATION ---
  const getEmailFromUsername = (usr: string) => {
    const cleanUser = usr.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanUser}@khet.com`;
  };

  const handleSignup = async () => {
    // 1. Validation
    if (!username.trim() || !password || !confirmPassword || !phone.trim() || !agristackId.trim()) {
       Alert.alert('Missing Details', 'Please fill in all fields (Username, Phone, AgriStack ID, Password).');
       return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }
    
    setIsLoading(true);

    const emailToRegister = getEmailFromUsername(username);

    // 2. Sign Up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailToRegister,
      password: password,
    });

    if (authError) {
      Alert.alert('Signup Failed', authError.message);
      setIsLoading(false);
      return;
    }

    // 3. Create Profile with CORRECT COLUMN NAMES
    if (authData.session?.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.session.user.id,
                username: username,
                mobile_no: phone,             // <--- FIXED: Changed from 'phone' to 'mobile_no'
                agristack_id: agristackId,    // <--- MATCHES: 'agristack_id'
                coins: 0,
                xp: 0
            });
        
        if (profileError) {
            console.error('Profile creation error:', profileError);
            Alert.alert('Profile Error', 'Account created but failed to save profile details.');
        }
    }

    setIsLoading(false);
    Alert.alert('Success', 'Account created! You are now logged in.');
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

        {/* --- USERNAME --- */}
        <Text style={styles.inputLabel}>USERNAME</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Choose a username"
          placeholderTextColor="#777"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        {/* --- PHONE NUMBER --- */}
        <Text style={styles.inputLabel}>PHONE NUMBER</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Enter mobile number"
          placeholderTextColor="#777"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* --- AGRISTACK ID --- */}
        <Text style={styles.inputLabel}>AGRISTACK ID</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Enter AgriStack ID"
          placeholderTextColor="#777"
          autoCapitalize="characters"
          value={agristackId}
          onChangeText={setAgristackId}
        />

        {/* --- PASSWORD --- */}
        <Text style={styles.inputLabel}>PASSWORD</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Create a password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* --- CONFIRM PASSWORD --- */}
        <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.input as StyleProp<TextStyle>}
          placeholder="Confirm your password"
          placeholderTextColor="#777"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* --- REGISTER BUTTON --- */}
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

        {/* --- LOGIN LINK --- */}
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
  
  avatarContainer: { 
    backgroundColor: '#1E1E1E', 
    borderRadius: 50, 
    padding: 15, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333'
  },

  inputLabel: { 
    color: '#AAAAAA', 
    fontSize: 12, 
    fontWeight: '800', 
    alignSelf: 'flex-start', 
    marginBottom: 8, 
    marginTop: 15,
    letterSpacing: 0.5
  },
  
  input: { 
    width: '100%', 
    backgroundColor: '#1E1E1E', 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 12,      
    borderWidth: 1, 
    borderColor: '#333333', 
    color: '#FFFFFF', 
    fontSize: 16 
  },

  actionButton: { width: '100%', paddingVertical: 16, borderRadius: 30, marginTop: 35 },
  actionButtonActive: { backgroundColor: '#388e3c' },
  actionButtonDisabled: { backgroundColor: '#333333' },
  
  actionButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '900', 
    textAlign: 'center', 
    letterSpacing: 1 
  },

  accountLinkContainer: { flexDirection: 'row', marginTop: 25 },
  accountLinkText: { color: '#888888', fontSize: 14, marginRight: 5 },
  loginHereText: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold' },
});