import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../utils/constants';

const StatCard = ({ label, value, icon, colors }) => {
    return (
        <LinearGradient
            colors={colors || [COLORS.card, COLORS.cardLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    icon: {
        fontSize: 28,
        marginBottom: 8,
    },
    value: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    label: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default StatCard;
