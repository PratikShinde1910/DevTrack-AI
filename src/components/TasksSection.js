import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { COLORS } from '../utils/constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TasksSection = ({ tasks, onToggle, onAdd, loading }) => {
    const [expanded, setExpanded] = useState(false);

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <TouchableOpacity
                    style={styles.headerInfo}
                    onPress={toggleExpand}
                    activeOpacity={0.7}
                >
                    <Text style={styles.headerTitle}>Today's Tasks</Text>
                    <Text style={styles.headerSubtitle}>
                        {completedTasks} / {totalTasks} completed
                    </Text>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
                        <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn}>
                        <Ionicons
                            name={expanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={COLORS.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {expanded && (
                <View style={styles.taskList}>
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
                    ) : tasks.length === 0 ? (
                        <Text style={styles.emptyText}>No tasks for today. Add one!</Text>
                    ) : (
                        tasks.map((task) => (
                            <TouchableOpacity
                                key={task._id}
                                style={styles.taskItem}
                                onPress={() => onToggle(task._id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.taskTitle,
                                    task.completed && styles.taskCompletedText
                                ]}>
                                    • {task.title}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    task.completed && styles.checkboxChecked
                                ]}>
                                    {task.completed && (
                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.darkLight,
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addBtn: {
        marginRight: 8,
    },
    expandBtn: {
        padding: 4,
    },
    taskList: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 8,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    taskTitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        flex: 1,
        fontWeight: '500',
    },
    taskCompletedText: {
        color: COLORS.textMuted,
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: COLORS.textMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 13,
        paddingVertical: 12,
        fontStyle: 'italic',
    }
});

export default TasksSection;
