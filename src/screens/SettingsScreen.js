import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const SettingsScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { showSnackbar } = useSnackbar();

    // Activity Summary Modal State
    const [summaryVisible, setSummaryVisible] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);

    const userName = user?.name || 'Developer';
    const userEmail = user?.email || 'developer@devtrack.ai';

    const handleOpenActivitySummary = async () => {
        setSummaryVisible(true);
        if (summaryData) return; // Don't refetch if we already have it temporarily

        setSummaryLoading(true);
        try {
            const response = await api.get('/progress/stats');
            setSummaryData({
                totalSessions: response.data.totalSessions || 0,
                streak: response.data.streak || 0,
                longestStreak: response.data.longestStreak || 0,
                totalHours: response.data.totalHours || 0,
                projectsLogged: response.data.projectsLogged || 0,
            });
        } catch (error) {
            console.error('Error fetching activity summary:', error);
            showSnackbar('Failed to load activity summary.', 'error');
            setSummaryVisible(false);
        } finally {
            setSummaryLoading(false);
        }
    };

    const SettingRow = ({ icon, label, destructive = false, onPress, value }) => (
        <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
            <View style={styles.settingRowLeft}>
                <View style={[styles.iconContainer, destructive && { backgroundColor: 'rgba(255, 69, 58, 0.15)' }]}>
                    <Ionicons name={icon} size={20} color={destructive ? COLORS.error : COLORS.primary} />
                </View>
                <Text style={[styles.settingLabel, destructive && { color: COLORS.error }]}>{label}</Text>
            </View>
            <View style={styles.settingRowRight}>
                {value && <Text style={styles.settingValueText}>{value}</Text>}
                {onPress && <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Title */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 1. User Info Header */}
                <View style={styles.headerProfileSection}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.headerUserName}>{userName}</Text>
                </View>

                {/* 2. Profile Controls Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.cardGroup}>
                        <SettingRow
                            icon="person-outline"
                            label="Edit Profile"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                    </View>
                </View>

                {/* 2. Activity Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.cardGroup}>
                        <SettingRow
                            icon="stats-chart-outline"
                            label="Activity Summary"
                            onPress={handleOpenActivitySummary}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="cellular-outline"
                            label="Progress Heatmap"
                            onPress={() => navigation.navigate('Progress')}
                        />
                    </View>
                </View>

                {/* 4. Preferences Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.cardGroup}>
                        <SettingRow
                            icon="moon-outline"
                            label="Dark Mode"
                            onPress={() => showSnackbar('Dark Mode setting coming soon in a future update!', 'success')}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="notifications-outline"
                            label="Notifications"
                            onPress={() => showSnackbar('Notification settings coming soon in a future update!', 'success')}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="language-outline"
                            label="Language"
                            onPress={() => showSnackbar('Language settings coming soon in a future update!', 'success')}
                        />
                    </View>
                </View>

                {/* 5. Information Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.cardGroup}>
                        <SettingRow
                            icon="shield-checkmark-outline"
                            label="Privacy Policy"
                            onPress={() => navigation.navigate('PrivacyPolicy')}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="information-circle-outline"
                            label="App Origin"
                            onPress={() => navigation.navigate('AppOrigin')}
                        />
                    </View>
                </View>

                {/* 6. Logout Button */}
                <View style={[styles.sectionContainer, styles.logoutContainer]}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Ionicons name="log-out-outline" size={20} color="#FF453A" style={{ marginRight: 8 }} />
                        <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Activity Summary Modal */}
                <Modal visible={summaryVisible} transparent animationType="fade" onRequestClose={() => setSummaryVisible(false)}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSummaryVisible(false)}>
                        <TouchableOpacity style={styles.summaryModalContent} activeOpacity={1}>
                            <View style={styles.summaryModalHeader}>
                                <Text style={styles.summaryModalTitle}>Activity Summary</Text>
                                <TouchableOpacity onPress={() => setSummaryVisible(false)} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>

                            {summaryLoading ? (
                                <View style={styles.summaryLoadingContainer}>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                </View>
                            ) : summaryData ? (
                                <View style={styles.summaryStatsContainer}>
                                    <View style={styles.summaryStatRow}>
                                        <View style={styles.summaryStatLeft}>
                                            <Text style={styles.summaryStatEmoji}>🔥</Text>
                                            <Text style={styles.summaryStatLabel}>Current Streak</Text>
                                        </View>
                                        <Text style={styles.summaryStatValue}>{summaryData.streak} days</Text>
                                    </View>
                                    <View style={styles.summaryStatRow}>
                                        <View style={styles.summaryStatLeft}>
                                            <Text style={styles.summaryStatEmoji}>🏆</Text>
                                            <Text style={styles.summaryStatLabel}>Longest Streak</Text>
                                        </View>
                                        <Text style={styles.summaryStatValue}>{summaryData.longestStreak} days</Text>
                                    </View>
                                    <View style={styles.summaryStatRow}>
                                        <View style={styles.summaryStatLeft}>
                                            <Text style={styles.summaryStatEmoji}>⏱</Text>
                                            <Text style={styles.summaryStatLabel}>Total Coding Time</Text>
                                        </View>
                                        <Text style={styles.summaryStatValue}>{summaryData.totalHours} hours</Text>
                                    </View>
                                    <View style={styles.summaryStatRow}>
                                        <View style={styles.summaryStatLeft}>
                                            <Text style={styles.summaryStatEmoji}>📊</Text>
                                            <Text style={styles.summaryStatLabel}>Total Sessions</Text>
                                        </View>
                                        <Text style={styles.summaryStatValue}>{summaryData.totalSessions}</Text>
                                    </View>
                                    <View style={styles.summaryStatRow}>
                                        <View style={styles.summaryStatLeft}>
                                            <Text style={styles.summaryStatEmoji}>🚀</Text>
                                            <Text style={styles.summaryStatLabel}>Projects Logged</Text>
                                        </View>
                                        <Text style={styles.summaryStatValue}>{summaryData.projectsLogged}</Text>
                                    </View>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    headerProfileSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary,
    },
    headerUserName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 6,
    },
    headerUserEmail: {
        fontSize: 14,
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 8,
    },
    cardGroup: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    settingRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    settingValueText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        marginLeft: 66, // Align line perfectly with text
    },
    logoutContainer: {
        marginTop: 8,
    },
    logoutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.3)',
    },
    logoutBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FF453A',
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryModalContent: {
        width: '85%',
        backgroundColor: COLORS.darkLight,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    summaryModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    summaryModalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    closeBtn: {
        padding: 4,
    },
    summaryLoadingContainer: {
        minHeight: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryStatsContainer: {
        gap: 16,
    },
    summaryStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryStatLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryStatEmoji: {
        fontSize: 20,
        marginRight: 12,
    },
    summaryStatLabel: {
        fontSize: 15,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    summaryStatValue: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
    },
});

export default SettingsScreen;
