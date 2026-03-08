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

const CreateNewPasswordScreen = ({ route, navigation }) => {
    const { email, otp } = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        const result = await resetPassword(email, otp, newPassword);
        setLoading(false);

        if (result.success) {
            Alert.alert(
                'Success',
                'Your password has been successfully reset.',
                [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
            );
        } else {
            Alert.alert('Error', result.message || 'Password reset failed.');
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
                        <Ionicons name="key-outline" size={48} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Create New Password</Text>
                    <Text style={styles.subtitle}>
                        Your new password must be unique from those previously used.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Min 6 characters"
                                placeholderTextColor={COLORS.textMuted}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.visibilityToggle}
                                onPress={() => setShowPassword(!showPassword)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={22}
                                    color={COLORS.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Re-type new password"
                                placeholderTextColor={COLORS.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleResetPassword} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient colors={GRADIENTS.primary} style={styles.actionButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Reset Password</Text>}
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
    inputContainer: { marginBottom: 20 },
    inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.text, fontSize: 15 },
    passwordContainer: { position: 'relative', justifyContent: 'center' },
    passwordInput: { paddingRight: 50 },
    visibilityToggle: { position: 'absolute', right: 16, height: '100%', justifyContent: 'center' },
    actionButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 4, marginTop: 12 },
    actionButtonText: { color: COLORS.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});

export default CreateNewPasswordScreen;
