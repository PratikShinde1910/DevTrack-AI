import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, GRADIENTS } from '../utils/constants';

const AppOriginScreen = ({ navigation }) => {
    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>App Origin</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🚀</Text>
                    </View>
                    <Text style={styles.appName}>DevTrack AI</Text>
                </View>

                <View style={styles.contentCard}>

                    <Text style={styles.sectionTitle}>About the Application</Text>
                    <Text style={styles.paragraph}>
                        DevTrack AI is a productivity tool designed specifically for developers. It simplifies the process of
                        logging daily activities and monitoring long-term coding habits without disrupting your workflow.
                    </Text>

                    <Text style={styles.sectionTitle}>Purpose</Text>
                    <Text style={styles.paragraph}>
                        Our primary goal is to help users track productivity, progress, or activities in a structured way.
                        By providing clear insights and a reliable streak system, we aim to encourage consistency and continuous learning.
                    </Text>

                    <Text style={styles.sectionTitle}>Development</Text>
                    <Text style={styles.paragraph}>
                        The application was developed using a modern tech stack:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• React Native for a seamless mobile interface</Text>
                        <Text style={styles.bulletItem}>• Node.js backend services for robust data handling</Text>
                        <Text style={styles.bulletItem}>• Secure authentication and verification flows</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Developer Note</Text>
                    <Text style={styles.paragraph}>
                        This application is actively being improved by our dedicated team. We are constantly exploring
                        new ways to enhance the user experience, and exciting new features may be added in future updates.
                    </Text>

                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>Version 1.0.0</Text>
                    </View>

                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        width: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    headerRight: {
        width: 40,
    },
    scrollContent: {
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    logoCircle: {
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
    logoEmoji: {
        fontSize: 36,
    },
    appName: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 1,
    },
    contentCard: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    bulletList: {
        marginTop: 8,
        marginBottom: 8,
        paddingLeft: 8,
    },
    bulletItem: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 28,
    },
    versionContainer: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default AppOriginScreen;
