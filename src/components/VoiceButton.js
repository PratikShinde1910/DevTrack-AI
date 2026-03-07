import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { parseVoiceInput } from '../services/voiceParser';
import { COLORS, GRADIENTS } from '../utils/constants';
import VoiceRecorderButton from './VoiceRecorderButton';

const VoiceButton = ({ onSave }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [step, setStep] = useState('input'); // 'input' | 'preview'
    const pulseAnim = useState(new Animated.Value(1))[0];

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
    };

    const handleMicPress = () => {
        setModalVisible(true);
        setStep('input');
        setVoiceText('');
        setParsedData(null);
    };

    const handleSimulatedVoice = () => {
        if (!voiceText.trim()) {
            Alert.alert('Empty Input', 'Please type or speak your progress.');
            return;
        }

        const parsed = parseVoiceInput(voiceText);
        setParsedData(parsed);
        setStep('preview');
    };

    const handleSave = () => {
        if (parsedData && onSave) {
            onSave({
                hours: parsedData.hours,
                problemsSolved: parsedData.problemsSolved,
                techLearned: parsedData.techLearned,
                notes: voiceText,
            });
        }
        setModalVisible(false);
        setStep('input');
        setVoiceText('');
        setParsedData(null);
    };

    const handleCancel = () => {
        setModalVisible(false);
        setStep('input');
        setVoiceText('');
        setParsedData(null);
        stopPulseAnimation();
    };

    return (
        <>
            <TouchableOpacity onPress={handleMicPress} activeOpacity={0.8}>
                <LinearGradient
                    colors={GRADIENTS.warm}
                    style={styles.fab}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.fabIcon}>🎤</Text>
                </LinearGradient>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {step === 'input' ? (
                            <>
                                <Text style={styles.modalTitle}>🎤 Voice Log</Text>
                                <Text style={styles.modalSubtitle}>
                                    Describe your coding session below.{'\n'}
                                    Example: "Today I coded for 3 hours and solved 5 problems using React"
                                </Text>

                                <View style={styles.recorderWrapper}>
                                    <VoiceRecorderButton
                                        onTextChange={(text) => {
                                            if (text) setVoiceText(text);
                                        }}
                                    />
                                    <Text style={styles.recorderHint}>Tap to speak</Text>
                                </View>

                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Type or paste your voice input here..."
                                    placeholderTextColor={COLORS.textMuted}
                                    value={voiceText}
                                    onChangeText={setVoiceText}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSimulatedVoice}>
                                        <LinearGradient
                                            colors={GRADIENTS.primary}
                                            style={styles.parseBtn}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Text style={styles.parseBtnText}>Parse Input</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>📋 Task Preview</Text>

                                <View style={styles.previewContainer}>
                                    <View style={styles.previewRow}>
                                        <Text style={styles.previewLabel}>⏱️ Hours coded</Text>
                                        <Text style={styles.previewValue}>{parsedData?.hours || 0}</Text>
                                    </View>
                                    <View style={styles.previewDivider} />
                                    <View style={styles.previewRow}>
                                        <Text style={styles.previewLabel}>✅ Problems solved</Text>
                                        <Text style={styles.previewValue}>{parsedData?.problemsSolved || 0}</Text>
                                    </View>
                                    <View style={styles.previewDivider} />
                                    <View style={styles.previewRow}>
                                        <Text style={styles.previewLabel}>💻 Technology</Text>
                                        <Text style={styles.previewValue}>
                                            {parsedData?.techLearned || 'Not detected'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.rawTextContainer}>
                                    <Text style={styles.rawTextLabel}>Raw input:</Text>
                                    <Text style={styles.rawText}>{voiceText}</Text>
                                </View>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setStep('input')}
                                    >
                                        <Text style={styles.cancelBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSave}>
                                        <LinearGradient
                                            colors={GRADIENTS.accent}
                                            style={styles.parseBtn}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Text style={[styles.parseBtnText, { color: COLORS.dark }]}>
                                                Save Entry
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#FF6584',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    fabIcon: {
        fontSize: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.darkLight,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    recorderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginBottom: 12,
    },
    recorderHint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    textInput: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        fontSize: 15,
        minHeight: 120,
        marginBottom: 20,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cancelBtn: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    cancelBtnText: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },
    parseBtn: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
    },
    parseBtnText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '700',
    },
    previewContainer: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    previewDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    previewLabel: {
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    previewValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    rawTextContainer: {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    rawTextLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    rawText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        lineHeight: 20,
    },
});

export default VoiceButton;
