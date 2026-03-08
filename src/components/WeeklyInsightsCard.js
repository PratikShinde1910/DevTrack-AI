import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { COLORS } from '../utils/constants';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const WeeklyInsightsCard = ({ totalHours, topTechnology, peakDay, loading }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        if (!loading) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpanded(!expanded);
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleExpand} style={styles.card}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="stats-chart" size={20} color={COLORS.primary} style={styles.icon} />
                    <Text style={styles.title}>Weekly Coding Insights</Text>
                </View>
                {!loading && (
                    <Ionicons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={COLORS.textMuted}
                    />
                )}
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Analyzing your week...</Text>
            ) : expanded ? (
                <View style={styles.content}>
                    <View style={styles.insightRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>
                            You coded <Text style={styles.highlight}>{totalHours} hours</Text> this week
                        </Text>
                    </View>
                    <View style={styles.insightRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>
                            Your most used technology was <Text style={styles.highlight}>{topTechnology}</Text>
                        </Text>
                    </View>
                    <View style={styles.insightRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>
                            Your most productive day was <Text style={styles.highlight}>{peakDay}</Text>
                        </Text>
                    </View>
                </View>
            ) : (
                <Text style={styles.collapsedPrompt}>Show Insights</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.darkLight,
        borderRadius: 16,
        padding: 18,
        marginTop: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    content: {
        marginTop: 12,
    },
    insightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        color: COLORS.primary,
        fontSize: 16,
        marginRight: 8,
        marginTop: -1,
    },
    text: {
        fontSize: 14,
        color: COLORS.textSecondary,
        flex: 1,
        lineHeight: 20,
    },
    highlight: {
        color: COLORS.text,
        fontWeight: '700',
    },
    loadingText: {
        color: COLORS.textMuted,
        fontStyle: 'italic',
        fontSize: 14,
        marginTop: 12,
    },
    collapsedPrompt: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
    }
});

export default WeeklyInsightsCard;
