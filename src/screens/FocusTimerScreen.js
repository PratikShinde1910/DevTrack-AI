import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useFocusTimer } from '../context/FocusTimerContext';
import { COLORS, GRADIENTS } from '../utils/constants';

const MIN_MINUTES = 5;
const MAX_MINUTES = 120;

const FocusTimerScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    const {
        durationMins,
        setDurationMins,
        sessionName,
        setSessionName,
        timeLeft,
        setTimeLeft,
        isActive,
        startTimer,
        pauseTimer,
        resetTimer,
        timerInitialized
    } = useFocusTimer();

    // Constants for SVG Circular Progress
    const size = 300;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    if (!timerInitialized) {
        // Render empty or loading state briefly while Async storage reads
        return (
            <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            </LinearGradient>
        );
    }

    const toggleTimer = () => {
        if (isActive) {
            pauseTimer();
        } else {
            startTimer();
        }
    };

    const handleIncreaseDuration = () => {
        if (!isActive && durationMins < MAX_MINUTES) {
            const newDuration = durationMins + 5;
            setDurationMins(newDuration);
            setTimeLeft(newDuration * 60);
        }
    };

    const handleDecreaseDuration = () => {
        if (!isActive && durationMins > MIN_MINUTES) {
            const newDuration = durationMins - 5;
            setDurationMins(newDuration);
            setTimeLeft(newDuration * 60);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress (0 to 1)
    const totalSeconds = durationMins * 60;
    const progress = totalSeconds === 0 ? 0 : timeLeft / totalSeconds;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient colors={GRADIENTS.background} style={styles.container}>
                    <StatusBar barStyle="light-content" />

                    {/* Header */}
                    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Timer</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    {/* Timer Circle Display */}
                    <View style={styles.timerContainer}>
                        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                                {/* Background Circle */}
                                <Circle
                                    stroke="rgba(255,255,255,0.05)"
                                    fill="none"
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    strokeWidth={strokeWidth}
                                />
                                {/* Animated Progress Circle */}
                                <Circle
                                    stroke={isActive ? COLORS.primary : COLORS.textMuted}
                                    fill="none"
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform={`rotate(-90 ${center} ${center})`}
                                />
                            </Svg>

                            <View style={styles.timerContent}>
                                <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                                <Text style={styles.statusText}>
                                    {isActive ? 'FOCUSING' : (timeLeft < durationMins * 60 ? 'PAUSED' : 'READY')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Customization Inputs (Hide while active or paused to minimize distraction) */}
                    <View style={styles.customizationContainer}>
                        {!isActive && timeLeft === durationMins * 60 ? (
                            <>
                                <View style={styles.durationRow}>
                                    <TouchableOpacity onPress={handleDecreaseDuration} style={styles.durationBtn}>
                                        <Ionicons name="remove" size={24} color={COLORS.text} />
                                    </TouchableOpacity>

                                    <Text style={styles.durationText}>{durationMins} min</Text>

                                    <TouchableOpacity onPress={handleIncreaseDuration} style={styles.durationBtn}>
                                        <Ionicons name="add" size={24} color={COLORS.text} />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.nameInput}
                                    value={sessionName}
                                    onChangeText={setSessionName}
                                    placeholder="Enter session name"
                                    placeholderTextColor={COLORS.textMuted}
                                    maxLength={30}
                                />
                            </>
                        ) : (
                            <View style={styles.activeSessionInfoRow}>
                                <Text style={styles.activeSessionName}>{sessionName}</Text>
                                <Text style={styles.activeSessionDuration}>({durationMins} min)</Text>
                            </View>
                        )}
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity
                            onPress={resetTimer}
                            style={styles.secondaryBtn}
                            disabled={timeLeft === durationMins * 60}
                        >
                            <Ionicons name="refresh" size={28} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleTimer}
                            style={styles.primaryBtnWrapper}
                        >
                            <LinearGradient
                                colors={isActive ? ['#FF6B6B', '#FF8E53'] : GRADIENTS.primary}
                                style={styles.primaryBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons
                                    name={isActive ? "pause" : "play"}
                                    size={36}
                                    color="#fff"
                                    style={{ marginLeft: isActive ? 0 : 4 }}
                                />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Spacer block */}
                        <View style={{ width: 64, height: 64 }} />
                    </View>

                </LinearGradient>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        padding: 10,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    timerContent: {
        alignItems: 'center',
    },
    timeText: {
        fontSize: 68,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 2,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 2,
        marginTop: 8,
    },
    customizationContainer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120, // Prevents layout snapping
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    durationBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    durationText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginHorizontal: 20,
        width: 65,
        textAlign: 'center',
    },
    nameInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: '80%',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeSessionInfoRow: {
        alignItems: 'center',
    },
    activeSessionName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    activeSessionDuration: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 50,
        paddingBottom: 60,
    },
    primaryBtnWrapper: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    primaryBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
});

export default FocusTimerScreen;
