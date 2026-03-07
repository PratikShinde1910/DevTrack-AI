import { LinearGradient } from 'expo-linear-gradient';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GRADIENTS } from '../utils/constants';

export default function VoiceRecorderButton({ onTextChange, disabled }) {
    const [recognizing, setRecognizing] = useState(false);
    const [speechGranted, setSpeechGranted] = useState(false);
    const pulseAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        ExpoSpeechRecognitionModule.requestPermissionsAsync().then((result) => {
            setSpeechGranted(result.status === 'granted');
        });
    }, []);

    const startPulseAnimation = useCallback(() => {
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
    }, [pulseAnim]);

    const stopPulseAnimation = useCallback(() => {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
    }, [pulseAnim]);

    useSpeechRecognitionEvent('start', () => {
        setRecognizing(true);
        startPulseAnimation();
    });

    useSpeechRecognitionEvent('end', () => {
        setRecognizing(false);
        stopPulseAnimation();
    });

    useSpeechRecognitionEvent('result', (event) => {
        onTextChange(event.results[0]?.transcript || '');
    });

    useSpeechRecognitionEvent('error', (event) => {
        console.log('Speech recognition error:', event.error, event.message);
        setRecognizing(false);
        stopPulseAnimation();
        if (event.error !== 'no-match') {
            Alert.alert('Error', `Speech recognition failed: ${event.message || event.error}`);
        }
    });

    const handlePress = async () => {
        if (disabled) return;

        if (!speechGranted) {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (result.status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Please grant microphone and speech recognition permissions in your settings to use this feature.'
                );
                return;
            }
            setSpeechGranted(true);
        }

        if (recognizing) {
            ExpoSpeechRecognitionModule.stop();
        } else {
            onTextChange(''); // Clear previously recorded text on a new session
            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
                maxAlternatives: 1,
                continuous: true,
            });
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={disabled}>
            <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                    colors={recognizing ? GRADIENTS.streak : GRADIENTS.warm}
                    style={styles.fab}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.fabIcon}>{recognizing ? '🛑' : '🎙️'}</Text>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        marginBottom: 8,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#FF6584',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    fabIcon: {
        fontSize: 26,
    },
});
