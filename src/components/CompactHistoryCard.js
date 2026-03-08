import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/constants';

const CompactHistoryCard = ({ hours, problems, tech, dateLabel, devLog }) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.dateLabel}>{dateLabel}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>⏱</Text>
                        <Text style={styles.statValue}>{hours || 0}h coded</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>✅</Text>
                        <Text style={styles.statValue}>{problems || 0} problems</Text>
                    </View>
                </View>

                {tech && (
                    <View style={styles.techRow}>
                        <Text style={styles.techIcon}>💻</Text>
                        <Text style={styles.techText} numberOfLines={1}>{tech}</Text>
                    </View>
                )}

                {devLog ? (
                    <View style={styles.devLogContainer}>
                        <Text style={styles.devLogTitle}>Dev Log</Text>
                        <Text style={styles.devLogText}>{devLog}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.darkLight, // Use solid color to hide swipe actions behind
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
    header: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.5,
    },
    content: {
        padding: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    statValue: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 16,
    },
    techRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    techIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    techText: {
        fontSize: 14,
        color: COLORS.accent,
        fontWeight: '700',
        flex: 1,
    },
    devLogContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    devLogTitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        fontWeight: '700',
    },
    devLogText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});

export default CompactHistoryCard;
