import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/constants';

// Render a simple horizontal 7-day contribution block instead of external heatmap dependencies
const ActivityHeatmap = ({ weeklyData = [] }) => {
    // Generate an array of 7 days, mapping data appropriately
    // Fallback block generation if array is empty
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Placeholder data or matched data
    const blocks = days.map((day, index) => {
        // Find existing data or default to 0 hours
        const existingData = weeklyData.find((d) => d.day === day) || { hours: 0 };

        // Determine color level based on hours
        let blockColor = 'rgba(255, 255, 255, 0.05)'; // Default Gray
        if (existingData.hours > 0 && existingData.hours <= 2) {
            blockColor = '#a3e4d7'; // Light green (1-2h)
        } else if (existingData.hours > 2 && existingData.hours <= 4) {
            blockColor = '#48c9b0'; // Medium green (3-4h)
        } else if (existingData.hours >= 5) {
            blockColor = '#117a65'; // Dark green (5h+)
        }

        return {
            id: index,
            dayLabel: day,
            color: blockColor,
            hours: existingData.hours, // for potential tooltip
        };
    });

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {blocks.map((block) => (
                    <View key={block.id} style={styles.dayContainer}>
                        <Text style={styles.dayText}>{block.dayLabel}</Text>
                        <View style={[styles.block, { backgroundColor: block.color }]} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
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
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    dayContainer: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    dayText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 8,
        fontWeight: '600',
    },
    block: {
        width: 32,
        height: 32,
        borderRadius: 6,
    },
});

export default ActivityHeatmap;
