import { StyleSheet, Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { COLORS } from '../utils/constants';

const StatCircle = ({ label, value, icon, color, progress }) => {
    return (
        <View style={styles.container}>
            <AnimatedCircularProgress
                size={90}
                width={8}
                fill={progress}
                tintColor={color}
                backgroundColor="rgba(255, 255, 255, 0.05)"
                rotation={0}
                lineCap="round"
                duration={1000}
            >
                {() => (
                    <View style={styles.innerContent}>
                        <Text style={styles.icon}>{icon}</Text>
                        <Text style={styles.value}>{value}</Text>
                    </View>
                )}
            </AnimatedCircularProgress>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    innerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 16,
        marginBottom: 2,
    },
    value: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    label: {
        marginTop: 12,
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default StatCircle;
