import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const AppSnackbar = ({ visible, message, type = 'success', onHide }) => {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-hide after 2.5 seconds
            const timer = setTimeout(() => {
                hideSnackbar();
            }, 3000);
            return () => clearTimeout(timer);
        } else if (shouldRender) {
            hideSnackbar();
        }
    }, [visible]);

    const hideSnackbar = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShouldRender(false);
            if (onHide) onHide();
        });
    };

    if (!shouldRender) return null;

    const iconName = type === 'success' ? 'checkmark-circle' : 'alert-circle';
    const iconColor = type === 'success' ? '#34C759' : '#FF3B30';

    return (
        <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
            <View style={styles.content}>
                <Ionicons name={iconName} size={24} color={iconColor} style={styles.icon} />
                <Text style={styles.messageText}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E', // Darker iOS-style background
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 100, // Fully rounded pill shape
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        maxWidth: '90%',
    },
    icon: {
        marginRight: 10,
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default AppSnackbar;
