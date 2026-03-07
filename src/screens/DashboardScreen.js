import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActivityHeatmap from '../components/ActivityHeatmap';
import TasksSection from '../components/TasksSection';
import VoiceButton from '../components/VoiceButton';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState({
        totalHours: 0,
        totalProblems: 0,
        streak: 0,
        today: { hours: 0, problems: 0, techLearned: '' },
    });
    const [tasks, setTasks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [weeklyActivity, setWeeklyActivity] = useState([]);

    // Task modal state
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [taskLoading, setTaskLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await api.get('/progress/stats');
            setStats(response.data);
            setWeeklyActivity(response.data.weeklyActivity || []);
        } catch (error) {
            console.log('Error fetching stats:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.log('Error fetching tasks:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchTasks()]);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchStats(), fetchTasks()]);
        setRefreshing(false);
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        setTaskLoading(true);
        try {
            const response = await api.post('/tasks', { title: newTaskTitle.trim() });
            setTasks([...tasks, response.data]);
            setNewTaskTitle('');
            setTaskModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add task');
        } finally {
            setTaskLoading(false);
        }
    };

    const handleToggleTask = async (taskId) => {
        // Optimistic UI update
        const updatedTasks = tasks.map(t =>
            t._id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);

        try {
            await api.patch(`/tasks/${taskId}/toggle`);
        } catch (error) {
            // Revert on error
            fetchTasks();
            Alert.alert('Error', 'Failed to update task');
        }
    };

    const handleVoiceSave = async (data) => {
        try {
            const response = await api.post('/progress', data);
            fetchData();
            Alert.alert('Success', 'Voice log saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save voice log.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const StatChip = ({ icon, value, label, color }) => (
        <View style={styles.statChip}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 1. Header Section */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View>
                    <Text style={styles.greetingText}>Hello,</Text>
                    <Text style={styles.headerTitle}>
                        {user?.name?.split(' ')[0] || 'Developer'} 👋
                    </Text>
                </View>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* 2. Weekly Activity Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Weekly Activity</Text>
                    <ActivityHeatmap weeklyData={weeklyActivity} />
                </View>

                {/* 3. Quick Stats Row (Compact) */}
                <View style={styles.compactStatsRow}>
                    <StatChip icon="🔥" value={`${stats.streak} day`} label="Streak" color="#FF6B6B" />
                    <StatChip icon="⏱" value={`${stats.totalHours} hr`} label="Total" color="#6C63FF" />
                    <StatChip icon="✅" value={`${stats.totalProblems}`} label="Solved" color="#43E97B" />
                </View>

                {/* 4. Today's Progress Card (Simplified) */}
                <View style={styles.progressCard}>
                    <Text style={styles.progressTitle}>Today's Progress</Text>
                    <View style={styles.progressStats}>
                        <Text style={styles.progressStatText}>{stats.today.hours}h coded | {stats.today.problems} problems</Text>
                    </View>
                    {stats.today.techLearned ? (
                        <Text style={styles.techText}>
                            Technology: <Text style={styles.techValue}>{stats.today.techLearned}</Text>
                        </Text>
                    ) : null}
                </View>

                {/* 5. Today's Tasks Card (Expandable) */}
                <TasksSection
                    tasks={tasks}
                    onToggle={handleToggleTask}
                    onAdd={() => setTaskModalVisible(true)}
                    loading={taskLoading}
                />

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Add Task Modal */}
            <Modal
                visible={taskModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setTaskModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Task</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="What needs to be done?"
                            placeholderTextColor={COLORS.textMuted}
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            autoFocus={true}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setTaskModalVisible(false)}
                                style={[styles.modalBtn, styles.cancelBtn]}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddTask}
                                style={[styles.modalBtn, styles.saveBtn]}
                                disabled={taskLoading}
                            >
                                {taskLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Floating Action Buttons */}
            <View style={[styles.fabContainer, { bottom: 85 + (insets.bottom || 0) }]}>
                <View style={{ marginRight: 16 }}>
                    <VoiceButton onSave={handleVoiceSave} />
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddProgress')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        style={styles.fab}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="add" size={30} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    greetingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
    },
    logoutBtn: {
        padding: 10,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 12,
        paddingLeft: 4,
    },
    compactStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.darkLight,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 9,
        color: COLORS.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    progressCard: {
        backgroundColor: COLORS.darkLight,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    progressStatText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    techText: {
        marginTop: 10,
        fontSize: 13,
        color: COLORS.textMuted,
    },
    techValue: {
        color: COLORS.accent,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.darkLight,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 14,
        color: COLORS.text,
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginLeft: 10,
    },
    cancelBtn: {
        backgroundColor: 'transparent',
    },
    cancelBtnText: {
        color: COLORS.textMuted,
        fontWeight: '700',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '800',
    },
    fabContainer: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default DashboardScreen;


