import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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

const VerifyOtpScreen = ({ route, navigation }) => {
    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { verifyResetOtp } = useAuth();

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit code.');
            return;
        }

        setLoading(true);
        const result = await verifyResetOtp(email, otp);
        setLoading(false);

        if (result.success) {
            navigation.navigate('CreateNewPassword', { email, otp });
        } else {
            Alert.alert('Error', result.message || 'Invalid or expired code. Please try again.');
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
                        <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.accent} />
                    </View>
                    <Text style={styles.title}>Enter Verification Code</Text>
                    <Text style={styles.subtitle}>
                        We have sent a 6-digit code to {email}. It will expire in 10 minutes.
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="_ _ _ _ _ _"
                            placeholderTextColor={COLORS.textMuted}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            textAlign="center"
                        />
                    </View>

                    <TouchableOpacity onPress={handleVerifyOtp} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient colors={GRADIENTS.accent} style={styles.actionButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {loading ? <ActivityIndicator color={COLORS.dark} /> : <Text style={styles.actionButtonText}>Verify Code</Text>}
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
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(67, 233, 123, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
    subtitle: {
        fontSize: 15,
        color: COLORS.textMuted,
        lineHeight: 22,
        marginBottom: 32,
    },
    inputContainer: { marginBottom: 32, alignItems: 'center' },
    otpInput: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, color: COLORS.text, fontSize: 32, letterSpacing: 12, fontWeight: 'bold', width: '100%' },
    actionButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 4 },
    actionButtonText: { color: COLORS.dark, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});

export default VerifyOtpScreen;
