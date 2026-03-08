import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const ProgressScreen = ({ navigation }) => {
    // states
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchMonthData = async (monthStr) => {
        setLoading(true);
        try {
            const response = await api.get(`/progress/month?month=${monthStr}`);
            setHeatmapData(response.data.days || []);
        } catch (error) {
            console.error('Failed to fetch month data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthData(currentMonth);
    }, [currentMonth]);

    const handlePrevMonth = () => {
        const [year, month] = currentMonth.split('-').map(Number);
        let nYear = year;
        let nMonth = month - 1;
        if (nMonth === 0) {
            nMonth = 12;
            nYear--;
        }
        setCurrentMonth(`${nYear}-${String(nMonth).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const [year, month] = currentMonth.split('-').map(Number);
        let nYear = year;
        let nMonth = month + 1;
        if (nMonth === 13) {
            nMonth = 1;
            nYear++;
        }
        setCurrentMonth(`${nYear}-${String(nMonth).padStart(2, '0')}`);
    };

    const formatMonthDisplay = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(Number(year), Number(month) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const handleDayPress = (dayData) => {
        setSelectedDay(dayData);
        setModalVisible(true);
    };

    const getBlockColor = (hours) => {
        if (!hours || hours === 0) return 'rgba(255, 255, 255, 0.05)';
        if (hours <= 2) return '#1f4d42'; // Low
        if (hours <= 4) return '#2ea082'; // Medium
        return COLORS.accent;             // High
    };

    const formatModalDate = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    };

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Progress Heatmap</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Month Control */}
            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.chevronBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{formatMonthDisplay(currentMonth)}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.chevronBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Heatmap Layout */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    {loading ? (
                        <View style={styles.loadingWrapper}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <>
                            <View style={styles.grid}>
                                {heatmapData.map((day, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.block, { backgroundColor: getBlockColor(day.hoursCoded) }]}
                                        onPress={() => handleDayPress(day)}
                                        activeOpacity={0.7}
                                    />
                                ))}
                            </View>

                            {/* Legend */}
                            <View style={styles.legend}>
                                <Text style={styles.legendText}>Less</Text>
                                <View style={[styles.legendBlock, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />
                                <View style={[styles.legendBlock, { backgroundColor: '#1f4d42' }]} />
                                <View style={[styles.legendBlock, { backgroundColor: '#2ea082' }]} />
                                <View style={[styles.legendBlock, { backgroundColor: COLORS.accent }]} />
                                <Text style={styles.legendText}>More</Text>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Selection Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    {selectedDay ? (
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalDate}>{formatModalDate(selectedDay.date)}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close-circle" size={26} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalStats}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{selectedDay.hoursCoded}h</Text>
                                    <Text style={styles.statLabel}>Coded</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{selectedDay.problemsSolved}</Text>
                                    <Text style={styles.statLabel}>Problems</Text>
                                </View>
                            </View>

                            <View style={styles.modalTech}>
                                <Text style={styles.modalTechTitle}>💻 Technologies</Text>
                                {selectedDay.technologies && selectedDay.technologies.length > 0 ? (
                                    <Text style={styles.modalTechText}>
                                        {selectedDay.technologies.join(', ')}
                                    </Text>
                                ) : (
                                    <Text style={styles.modalTechEmpty}>No technologies logged</Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.modalContent} />
                    )}
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginVertical: 12,
    },
    chevronBtn: {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.2)',
    },
    monthText: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 10 },
    card: {
        backgroundColor: 'rgba(26, 30, 50, 0.6)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    loadingWrapper: { height: 260, justifyContent: 'center', alignItems: 'center' },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 10,
        rowGap: 10,
    },
    block: {
        width: 32,
        height: 32,
        borderRadius: 6,
    },
    legend: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    legendText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginHorizontal: 4 },
    legendBlock: { width: 14, height: 14, borderRadius: 4 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: COLORS.cardLight,
        width: '100%',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalDate: { fontSize: 22, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5 },
    modalStats: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        paddingVertical: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statBox: { alignItems: 'center', flex: 1 },
    statDivider: { width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    statVal: { fontSize: 28, fontWeight: '900', color: COLORS.text },
    statLabel: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    modalTechTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    modalTechText: { fontSize: 16, color: COLORS.accent, lineHeight: 24, fontWeight: '600' },
    modalTechEmpty: { fontSize: 15, color: COLORS.textMuted, fontStyle: 'italic' },
});

export default ProgressScreen;
