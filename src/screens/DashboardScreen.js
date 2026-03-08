import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActivityHeatmap from '../components/ActivityHeatmap';
import TasksSection from '../components/TasksSection';
import VoiceButton from '../components/VoiceButton';
import WeeklyInsightsCard from '../components/WeeklyInsightsCard';
import { useAuth } from '../context/AuthContext';
import { useFocusTimer } from '../context/FocusTimerContext';
import { useSnackbar } from '../context/SnackbarContext';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { showSnackbar } = useSnackbar();
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

    // Insights state
    const [insights, setInsights] = useState({ totalHours: 0, topTechnology: 'None', peakDay: 'None' });
    const [insightsLoading, setInsightsLoading] = useState(true);

    // Interactive Heatmap State
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    });
    const [selectedDayStats, setSelectedDayStats] = useState(null);
    const [selectedDayLoading, setSelectedDayLoading] = useState(false);
    const [selectedDayLabel, setSelectedDayLabel] = useState('Today');

    // Context bindings
    const { isActive, timeLeft, durationMins } = useFocusTimer();

    // Task modal state
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [taskLoading, setTaskLoading] = useState(false);

    // Flag to prevent multiple parallel fetches
    const isFetchingRef = useRef(false);
    const hasInitialLoadedRef = useRef(false);

    // Logout Modal State
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/progress/stats');
            setStats(response.data);
            setWeeklyActivity(response.data.weeklyActivity || []);
        } catch (error) {
            console.log('Error fetching stats:', error);
        }
    }, []);

    const fetchSelectedDayData = useCallback(async (dateStr, label = null) => {
        try {
            setSelectedDayLoading(true);

            // Is the selected day actually today or yesterday?
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

            let displayLabel = label || selectedDayLabel;

            if (dateStr === todayStr) {
                displayLabel = 'Today';
            } else if (dateStr === yesterdayStr) {
                displayLabel = 'Yesterday';
            }

            const response = await api.get(`/progress/day?date=${dateStr}`);
            setSelectedDayStats(response.data);
            setSelectedDate(dateStr);
            setSelectedDayLabel(displayLabel);
        } catch (error) {
            console.error('Error fetching specific day:', error);
        } finally {
            setSelectedDayLoading(false);
        }
    }, [selectedDayLabel]);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.log('Error fetching tasks:', error);
        }
    }, []);

    const fetchInsights = useCallback(async () => {
        try {
            setInsightsLoading(true);
            const response = await api.get('/api/insights/weekly');
            setInsights(response.data);
        } catch (error) {
            console.log('Error fetching insights:', error);
        } finally {
            setInsightsLoading(false);
        }
    }, []);

    const fetchData = useCallback(async (isInitial = false) => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            if (isInitial && !hasInitialLoadedRef.current) setLoading(true);

            // Parallel fetch for all dashboard components
            await Promise.all([
                fetchStats(),
                fetchTasks(),
                fetchInsights(),
                fetchSelectedDayData(selectedDate)
            ]);

            if (isInitial) hasInitialLoadedRef.current = true;
        } catch (error) {
            console.log('Error in fetchData:', error);
        } finally {
            if (isInitial) setLoading(false);
            isFetchingRef.current = false;
        }
    }, [fetchStats, fetchTasks, fetchInsights, fetchSelectedDayData, selectedDate]);

    useFocusEffect(
        useCallback(() => {
            fetchData(true);
        }, [fetchData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchStats(), fetchTasks(), fetchInsights()]);
        setRefreshing(false);
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            showSnackbar('Please enter a task title', 'error');
            return;
        }

        setTaskLoading(true);
        try {
            const response = await api.post('/tasks', { title: newTaskTitle.trim() });
            setTasks([...tasks, response.data]);
            setNewTaskTitle('');
            setTaskModalVisible(false);
        } catch (error) {
            showSnackbar('Failed to add task', 'error');
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
            showSnackbar('Failed to update task', 'error');
        }
    };

    const handleVoiceSave = async (data) => {
        try {
            const response = await api.post('/progress', data);
            fetchData();
            showSnackbar('Voice log saved!', 'success');
        } catch (error) {
            showSnackbar('Failed to save voice log.', 'error');
        }
    };

    const getProgressTitle = (label) => {
        if (!label) return "TODAY'S PROGRESS";
        if (label.toUpperCase() === 'TODAY') return "TODAY'S PROGRESS";
        if (label.toUpperCase() === 'YESTERDAY') return "YESTERDAY'S PROGRESS";

        const dayMap = {
            'Mon': 'MONDAY',
            'Tue': 'TUESDAY',
            'Wed': 'WEDNESDAY',
            'Thu': 'THURSDAY',
            'Fri': 'FRIDAY',
            'Sat': 'SATURDAY',
            'Sun': 'SUNDAY'
        };

        const fullDay = dayMap[label] || label.toUpperCase();
        return `${fullDay}'S PROGRESS`;
    };

    const handleLogout = () => {
        setLogoutModalVisible(true);
    };

    const confirmLogout = () => {
        setLogoutModalVisible(false);
        logout();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('FocusTimer')} style={[styles.logoutBtn, { marginRight: 12 }]}>
                        <Ionicons name="timer-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={24} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {isActive && timeLeft > 0 ? (
                <TouchableOpacity
                    onPress={() => navigation.navigate('FocusTimer')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        style={styles.activeTimerBanner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="timer" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitle}>Focus session running</Text>
                            <Text style={styles.bannerTime}>⏱ {formatTime(timeLeft)} remaining</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                    </LinearGradient>
                </TouchableOpacity>
            ) : null}

            {loading && !refreshing ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            ) : (
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
                        <ActivityHeatmap
                            weeklyData={weeklyActivity}
                            selectedDate={selectedDate}
                            onSelectDay={(dateStr, label) => fetchSelectedDayData(dateStr, label)}
                        />
                    </View>

                    {/* 3. Today's Progress Card (Hero) dynamically updated per day */}
                    <View style={[styles.progressCard, styles.heroCard]}>
                        <Text style={styles.progressTitle}>
                            {getProgressTitle(selectedDayLabel)}
                        </Text>

                        {selectedDayLoading ? (
                            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
                        ) : selectedDayStats && selectedDayStats.hoursCoded === 0 && selectedDayStats.problemsSolved === 0 ? (
                            <Text style={styles.heroNoActivity}>No activity logged on this day.</Text>
                        ) : (
                            <>
                                <View style={styles.progressStats}>
                                    <Text style={styles.heroMainStat}>
                                        {selectedDayStats ? selectedDayStats.hoursCoded : stats.today.hours}h coded |{' '}
                                        {selectedDayStats ? selectedDayStats.problemsSolved : stats.today.problems} problems
                                    </Text>
                                </View>

                                {(selectedDayStats?.technologies?.length > 0 || stats.today.techLearned) ? (
                                    <Text style={styles.techText}>
                                        Technology: <Text style={styles.techValue}>
                                            {selectedDayStats
                                                ? selectedDayStats.technologies.join(', ')
                                                : stats.today.techLearned
                                            }
                                        </Text>
                                    </Text>
                                ) : null}
                            </>
                        )}

                        <View style={styles.heroDivider} />

                        <View style={styles.heroSubStatsRow}>
                            <Text style={styles.heroSubStatText}>
                                🔥 Streak: <Text style={styles.heroSubStatValue}>
                                    {selectedDayStats ? selectedDayStats.streakUpToDate : stats.streak} {
                                        (selectedDayStats ? selectedDayStats.streakUpToDate : stats.streak) === 1 ? 'day' : 'days'
                                    }
                                </Text>
                            </Text>
                            <Text style={styles.heroSubStatText}>
                                ⏱ Total this week: <Text style={styles.heroSubStatValue}>
                                    {selectedDayStats ? selectedDayStats.totalWeekHours : stats.totalHours} hr
                                </Text>
                            </Text>
                            <Text style={styles.heroSubStatText}>
                                ✅ Problems solved: <Text style={styles.heroSubStatValue}>
                                    {selectedDayStats ? selectedDayStats.cumulativeProblemsSolved : stats.totalProblems}
                                </Text>
                            </Text>
                        </View>
                    </View>

                    {/* 5. Today's Tasks Card (Expandable) */}
                    <TasksSection
                        tasks={tasks}
                        onToggle={handleToggleTask}
                        onAdd={() => setTaskModalVisible(true)}
                        loading={taskLoading}
                    />

                    {/* 6. Weekly Coding Insights */}
                    <WeeklyInsightsCard
                        totalHours={insights.totalHours}
                        topTechnology={insights.topTechnology}
                        peakDay={insights.peakDay}
                        loading={insightsLoading}
                    />

                    <View style={{ height: 120 }} />
                </ScrollView>
            )}

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

            {/* Logout Confirmation Modal */}
            <Modal
                visible={logoutModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Logout</Text>
                        <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 24 }}>
                            Are you sure you want to log out of your account?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setLogoutModalVisible(false)}
                                style={[styles.modalBtn, styles.cancelBtn]}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmLogout}
                                style={[styles.modalBtn, { backgroundColor: 'rgba(255, 69, 58, 0.2)' }]}
                            >
                                <Text style={[styles.saveBtnText, { color: '#FF453A' }]}>Logout</Text>
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
    activeTimerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 14,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    bannerTime: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
        fontWeight: '600',
    },
    progressCard: {
        backgroundColor: COLORS.darkLight,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    heroCard: {
        paddingVertical: 22,
        backgroundColor: 'rgba(30,30,40,0.8)',
        borderColor: 'rgba(67, 233, 123, 0.3)',
        borderWidth: 1,
        shadowColor: '#43E97B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 12,
        letterSpacing: 1,
    },
    heroMainStat: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '900',
        marginBottom: 4,
    },
    heroNoActivity: {
        fontSize: 15,
        color: COLORS.textMuted,
        fontStyle: 'italic',
        marginVertical: 12,
    },
    techText: {
        marginTop: 6,
        fontSize: 14,
        color: COLORS.textMuted,
    },
    techValue: {
        color: '#fff',
        fontWeight: '700',
    },
    heroDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 16,
    },
    heroSubStatsRow: {
        flexDirection: 'column',
        gap: 10,
    },
    heroSubStatText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: 8,
    },
    heroSubStatValue: {
        color: '#fff',
        fontWeight: '800',
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
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default DashboardScreen;


