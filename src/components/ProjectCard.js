import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, GRADIENTS } from '../utils/constants';

const ProjectCard = ({ project, onPress }) => {
    const { name, progress, iconUrl } = project;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.header}>
                    {iconUrl ? (
                        <Image source={{ uri: iconUrl }} style={styles.icon} />
                    ) : (
                        <View style={styles.iconPlaceholder}>
                            <Text style={styles.iconPlaceholderText}>{name.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <Text style={styles.name}>{name}</Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.statsLabel}>Progress</Text>
                        <Text style={styles.progressPercent}>{progress || 0}%</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <LinearGradient
                            colors={GRADIENTS.primary}
                            style={[styles.progressBarFill, { width: `${progress || 0}%` }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    iconPlaceholderText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    name: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.2,
        flex: 1,
    },
    progressContainer: {
        marginTop: 4,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statsLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});

export default ProjectCard;
