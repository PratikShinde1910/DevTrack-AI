import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSnackbar } from '../context/SnackbarContext';
import { COLORS, GRADIENTS } from '../utils/constants';

const PrivacyPolicyScreen = ({ navigation }) => {
    const { showSnackbar } = useSnackbar();

    const handleLinkPress = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                showSnackbar('No app installed to handle this action.', 'error');
            }
        } catch (error) {
            showSnackbar('No app installed to handle this action.', 'error');
        }
    };
    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentCard}>

                    <Text style={styles.sectionTitle}>Introduction</Text>
                    <Text style={styles.paragraph}>
                        DevTrack AI respects your privacy and is committed to protecting it. We only collect the minimal information
                        required for authentication and application functionality.
                    </Text>

                    <Text style={styles.sectionTitle}>Information Collected</Text>
                    <Text style={styles.paragraph}>
                        We may collect the following information when you use our application:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• Name</Text>
                        <Text style={styles.bulletItem}>• Email address</Text>
                        <Text style={styles.bulletItem}>• Activity or progress data generated within the app</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Use of Information</Text>
                    <Text style={styles.paragraph}>
                        The information we collect is used solely for:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• Account authentication</Text>
                        <Text style={styles.bulletItem}>• Personalizing the user experience</Text>
                        <Text style={styles.bulletItem}>• Saving user progress inside the app</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Data Security</Text>
                    <Text style={styles.paragraph}>
                        Authentication and password reset features are secured using verification codes and protected backend services
                        to ensure your data remains safe.
                    </Text>

                    <Text style={styles.sectionTitle}>Third-Party Services</Text>
                    <Text style={styles.paragraph}>
                        Our application may use third-party services for essential functionality, such as:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• Email delivery services</Text>
                        <Text style={styles.bulletItem}>• Backend hosting providers</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Data Sharing</Text>
                    <Text style={styles.paragraph}>
                        We value your trust. User data is not sold or shared with any third parties for marketing or advertising purposes.
                    </Text>

                    <Text style={styles.sectionTitle}>User Control</Text>
                    <Text style={styles.paragraph}>
                        You retain control over your data. You can modify your profile information or reset your password directly
                        through the application settings at any time.
                    </Text>

                    <Text style={styles.paragraph}>
                        We do not sell, rent, or share personal information with third parties except
                        when required to provide core application services.
                    </Text>

                    <Text style={styles.sectionTitle}>Contact</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions or concerns about this privacy policy, please contact us at:
                    </Text>
                    <TouchableOpacity onPress={() => handleLinkPress('mailto:support@devtrack.ai')}>
                        <Text style={styles.linkText}>support@devtrack.ai</Text>
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.fullPolicyButton}
                            onPress={() => handleLinkPress('https://pratikshinde1910.github.io/devtrack-privacy-policy/')}
                        >
                            <Text style={styles.fullPolicyButtonText}>View Full Privacy Policy</Text>
                        </TouchableOpacity>
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
    linkText: {
        fontSize: 15,
        color: COLORS.primary,
        marginTop: 4,
        textDecorationLine: 'underline',
    },
    buttonContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    fullPolicyButton: {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
        width: '100%',
        alignItems: 'center',
    },
    fullPolicyButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PrivacyPolicyScreen;
