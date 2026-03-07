import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, GRADIENTS } from '../utils/constants';

const SettingsScreen = () => {
    const { user, logout } = useAuth(); // Assume user object has { name, email }

    // Fallback if user data is missing
    const userName = user?.name || 'Developer';
    const userEmail = user?.email || 'developer@devtrack.ai';

    const handleLinkPress = (url) => {
        Linking.openURL(url).catch(err => console.error("Couldn't open link", err));
    };

    const SettingRow = ({ icon, label, destructive = false, onPress }) => (
        <TouchableOpacity style={styles.settingRow} onPress={onPress}>
            <View style={styles.settingRowLeft}>
                <View style={[styles.iconContainer, destructive && { backgroundColor: 'rgba(255, 69, 58, 0.15)' }]}>
                    <Ionicons name={icon} size={20} color={destructive ? COLORS.error : COLORS.primary} />
                </View>
                <Text style={[styles.settingLabel, destructive && { color: COLORS.error }]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
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

                {/* Profile Header Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userName}</Text>
                        <Text style={styles.profileEmail}>{userEmail}</Text>
                    </View>
                    <TouchableOpacity style={styles.editBtn}>
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Section: General Settings */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>General Settings</Text>
                    <View style={styles.cardGroup}>
                        <SettingRow icon="person-outline" label="Account" />
                        <View style={styles.divider} />
                        <SettingRow icon="color-palette-outline" label="Appearance" />
                        <View style={styles.divider} />
                        <SettingRow icon="language-outline" label="Language" />
                        <View style={styles.divider} />
                        <SettingRow icon="notifications-outline" label="Notifications" />
                    </View>
                </View>

                {/* Section: App Information */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>App Information</Text>
                    <View style={styles.cardGroup}>
                        <SettingRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => handleLinkPress('https://devtrack.ai/privacy')} />
                        <View style={styles.divider} />
                        <SettingRow icon="document-text-outline" label="Terms & Conditions" onPress={() => handleLinkPress('https://devtrack.ai/terms')} />
                        <View style={styles.divider} />
                        <SettingRow icon="information-circle-outline" label="About DevTrack AI" />
                        <View style={styles.divider} />
                        <SettingRow icon="star-outline" label="Rate the App" />
                        <View style={styles.divider} />
                        <SettingRow icon="share-social-outline" label="Share App" />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#FF453A" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>

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
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primary,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    editBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
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
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        marginLeft: 66, // Align line perfectly with text
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
        marginTop: 16,
    },
    logoutBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FF453A',
        letterSpacing: 0.5,
    },
});

export default SettingsScreen;
