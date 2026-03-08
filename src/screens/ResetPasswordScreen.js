import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, GRADIENTS } from '../utils/constants';

const ResetPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { requestPasswordReset } = useAuth();

    const handleSendCode = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your registered email address.');
            return;
        }

        setLoading(true);
        const result = await requestPasswordReset(email.trim().toLowerCase());
        setLoading(false);

        if (result.success) {
            Alert.alert('Code Sent', 'If this email is registered, you will receive a 6-digit verification code shortly.');
            navigation.navigate('VerifyOtp', { email: email.trim().toLowerCase() });
        } else {
            Alert.alert('Error', result.message);
        }
    };

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-outline" size={48} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your registered email address. We will send you a 6-digit verification code.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity onPress={handleSendCode} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient colors={GRADIENTS.primary} style={styles.actionButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Send Code</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    headerContainer: { paddingTop: 60, paddingHorizontal: 20 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(108, 99, 255, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
    subtitle: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22, marginBottom: 32 },
    inputContainer: { marginBottom: 24 },
    inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.text, fontSize: 15 },
    actionButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 4 },
    actionButtonText: { color: COLORS.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});

export default ResetPasswordScreen;
