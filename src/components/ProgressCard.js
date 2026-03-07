import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/constants';

const ProgressCard = ({ hours, problems, techLearned }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>📊 Today&apos;s Progress</Text>
            <View style={styles.divider} />
            <View style={styles.row}>
                <View style={styles.item}>
                    <Text style={styles.value}>{hours || 0}h</Text>
                    <Text style={styles.label}>Hours Coded</Text>
                </View>
                <View style={styles.vertDivider} />
                <View style={styles.item}>
                    <Text style={styles.value}>{problems || 0}</Text>
                    <Text style={styles.label}>Problems Solved</Text>
                </View>
            </View>
            {techLearned ? (
                <View style={styles.techRow}>
                    <Text style={styles.techLabel}>💻 Technology</Text>
                    <Text style={styles.techValue}>{techLearned}</Text>
                </View>
            ) : (
                <View style={styles.techRow}>
                    <Text style={styles.noActivityText}>
                        No activity logged today. Start coding! 💪
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginVertical: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    item: {
        flex: 1,
        justifyContent: 'center',
    },
    vertDivider: {
        width: 1,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginHorizontal: 16,
    },
    value: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: -1,
    },
    label: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 6,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    techRow: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.06)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    techLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginRight: 10,
        fontWeight: '500',
    },
    techValue: {
        fontSize: 15,
        color: COLORS.accent,
        fontWeight: '800',
        flex: 1,
    },
    noActivityText: {
        fontSize: 14,
        color: '#8e9eab',
        fontStyle: 'italic',
    },
});

export default ProgressCard;
