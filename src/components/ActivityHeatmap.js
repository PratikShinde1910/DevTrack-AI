import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../utils/constants';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(26, 30, 50, 0.6)',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    dayContainer: {
        alignItems: 'center',
        flex: 1,
    },
    dayText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 10,
        fontWeight: '600',
    },
    block: {
        width: 34,
        height: 34,
        borderRadius: 8,
    },
    blockSelected: {
        borderWidth: 2,
        borderColor: COLORS.accent,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
    },
    dayTextSelected: {
        color: COLORS.primary,
        fontWeight: '800',
    }
});

const AnimatedDayBlock = ({ block, onSelectDay }) => {
    const scaleAnim = useRef(new Animated.Value(block.isSelected ? 1.08 : 1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: block.isSelected ? 1.08 : 1,
            useNativeDriver: true,
            friction: 6,
            tension: 40,
        }).start();
    }, [block.isSelected, scaleAnim]);

    return (
        <TouchableOpacity
            style={styles.dayContainer}
            activeOpacity={0.7}
            onPress={() => {
                if (block.date && onSelectDay) {
                    onSelectDay(block.date, block.dayLabel);
                }
            }}
        >
            <Text style={[styles.dayText, block.isSelected && styles.dayTextSelected]}>
                {block.dayLabel}
            </Text>
            <Animated.View style={[
                styles.block,
                {
                    backgroundColor: block.color,
                    transform: [{ scale: scaleAnim }],
                },
                block.isSelected && styles.blockSelected
            ]} />
        </TouchableOpacity>
    );
};

const ActivityHeatmap = ({ weeklyData = [], selectedDate, onSelectDay }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const blocks = days.map((day, index) => {
        const existingData = weeklyData.find((d) => d.day === day) || { hours: 0, date: null };

        let blockColor = 'rgba(255, 255, 255, 0.05)';
        if (existingData.hours > 0 && existingData.hours < 3) {
            blockColor = '#1f4d42';
        } else if (existingData.hours >= 3 && existingData.hours < 6) {
            blockColor = '#2ea082';
        } else if (existingData.hours >= 6) {
            blockColor = COLORS.accent;
        }

        const isSelected = selectedDate && existingData.date === selectedDate;

        return {
            id: index,
            dayLabel: day,
            color: blockColor,
            hours: existingData.hours,
            date: existingData.date,
            isSelected
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {blocks.map((block) => (
                    <AnimatedDayBlock key={block.id} block={block} onSelectDay={onSelectDay} />
                ))}
            </View>
        </View>
    );
};

export default ActivityHeatmap;
