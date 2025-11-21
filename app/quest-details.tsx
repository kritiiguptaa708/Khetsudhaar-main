import { supabase } from '@/utils/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Coin from '../assets/images/Qcoin.svg';

const PIXEL_FONT = 'monospace';

export default function QuestDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); 
    
    const [quest, setQuest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!id) return;

                // 1. Fetch Quest Info
                const { data: questData, error } = await supabase
                    .from('quests')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                setQuest(questData);

                // 2. Check Completion
                if (session?.user?.id) {
                    const { data } = await supabase
                        .from('user_quests')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .eq('quest_id', id)
                        .maybeSingle();
                    if (data) setIsCompleted(true);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAction = () => {
        if (isCompleted) {
            router.back();
        } else {
            // --- CRITICAL CHANGE: Go to Quiz for Verification ---
            router.push({
                pathname: '/quest-quiz',
                params: { id: id } // Pass the Quest ID to the quiz
            });
        }
    };

    if (loading) return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#4CAF50" /></SafeAreaView>;
    if (!quest) return <SafeAreaView style={styles.loadingContainer}><Text style={{color:'white'}}>Quest not found.</Text></SafeAreaView>;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                
                {/* Main Card */}
                <View style={styles.mainCard}>
                    <View style={styles.titleRow}>
                        <FontAwesome5 name="seedling" size={24} color="#4CAF50" style={{marginRight: 10}} />
                        <Text style={styles.questTitle}>{quest.title}</Text>
                    </View>
                    <View style={styles.rewardBox}>
                        <Text style={styles.rewardLabel}>REWARD:</Text>
                        <Coin width={20} height={20} />
                        <Text style={styles.rewardValue}>{quest.xp_reward} XP</Text>
                    </View>
                    <Text style={styles.statusText}>STATUS: {isCompleted ? 'COMPLETED' : 'PENDING VERIFICATION'}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: isCompleted ? '100%' : '0%' }]} />
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>MISSION BRIEF</Text>
                    <Text style={styles.descriptionText}>{quest.description}</Text>
                </View>

                {/* Steps (Static for now, or dynamic if you add a steps column) */}
                <View style={styles.stepsSection}>
                    <Text style={styles.sectionTitle}>TASKS</Text>
                    <View style={styles.stepRow}>
                        <FontAwesome5 name={isCompleted ? "check-circle" : "circle"} size={16} color={isCompleted ? "#4CAF50" : "#888"} />
                        <Text style={styles.stepText}>Complete the learning module</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <FontAwesome5 name={isCompleted ? "check-circle" : "circle"} size={16} color={isCompleted ? "#4CAF50" : "#888"} />
                        <Text style={styles.stepText}>Pass the verification quiz</Text>
                    </View>
                </View>

                {/* Action Button */}
                <View style={styles.actionContainer}>
                    <View style={styles.divider} />
                    <TouchableOpacity 
                        style={[styles.actionButton, isCompleted && styles.actionButtonCompleted]} 
                        onPress={handleAction}
                    >
                        <Text style={styles.actionButtonText}>
                            {isCompleted ? 'QUEST COMPLETED' : 'TAKE QUIZ TO VERIFY'}
                        </Text>
                        {!isCompleted && <FontAwesome5 name="arrow-right" size={16} color="white" style={{marginLeft: 10}} />}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#151718' },
    loadingContainer: { flex: 1, backgroundColor: '#151718', justifyContent: 'center', alignItems: 'center' },
    scrollContainer: { padding: 20 },
    
    mainCard: { backgroundColor: '#2C2C2E', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 2, borderColor: '#4CAF50' },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    questTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', fontFamily: PIXEL_FONT, flex: 1 },
    rewardBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.1)', padding: 10, borderRadius: 10, marginBottom: 15 },
    rewardLabel: { color: '#4CAF50', fontWeight: 'bold', marginRight: 5 },
    rewardValue: { color: 'white', fontWeight: '900', marginLeft: 5, fontFamily: PIXEL_FONT },
    statusText: { color: '#B0B0B0', fontSize: 12, marginBottom: 8, fontFamily: PIXEL_FONT },
    progressBarBg: { height: 8, backgroundColor: '#333', borderRadius: 4 },
    progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },

    infoSection: { marginBottom: 25 },
    sectionTitle: { color: '#3498DB', fontSize: 16, fontWeight: 'bold', fontFamily: PIXEL_FONT, marginBottom: 10, textTransform: 'uppercase' },
    descriptionText: { color: '#DEDEDE', fontSize: 16, lineHeight: 24 },

    stepsSection: { marginBottom: 30 },
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingLeft: 10 },
    stepText: { color: '#EEE', marginLeft: 10, fontSize: 15 },

    actionContainer: { marginTop: 10 },
    divider: { height: 1, backgroundColor: '#333', marginBottom: 20 },
    actionButton: { flexDirection: 'row', backgroundColor: '#FFC107', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC107', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
    actionButtonCompleted: { backgroundColor: '#333', shadowOpacity: 0, borderWidth: 1, borderColor: '#555' },
    actionButtonText: { color: '#151718', fontSize: 16, fontWeight: 'bold', fontFamily: PIXEL_FONT },
});