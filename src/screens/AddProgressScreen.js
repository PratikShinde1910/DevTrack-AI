import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSnackbar } from '../context/SnackbarContext';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const AddProgressScreen = ({ navigation, route }) => {
    const { showSnackbar } = useSnackbar();
    const [hours, setHours] = useState('');
    const [problemsSolved, setProblemsSolved] = useState('');
    const [techStack, setTechStack] = useState([]);
    const [techInput, setTechInput] = useState('');
    const [devLog, setDevLog] = useState('');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const editEntry = route?.params?.entry;

    useEffect(() => {
        if (editEntry) {
            setHours(editEntry.hours?.toString() || '');
            setProblemsSolved(editEntry.problemsSolved?.toString() || '');
            // Convert to array if it was stored as string previously
            const tech = editEntry.techLearned;
            setTechStack(Array.isArray(tech) ? tech : (tech ? tech.split(',').map(t => t.trim()) : []));
            setDevLog(editEntry.devLog || '');
            setSelectedProjectId(editEntry.projectId);
        }
    }, [editEntry]);

    const addTech = () => {
        if (techInput.trim()) {
            if (!techStack.includes(techInput.trim())) {
                setTechStack([...techStack, techInput.trim()]);
            }
            setTechInput('');
        }
    };

    const removeTech = (tech) => {
        setTechStack(techStack.filter(t => t !== tech));
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
                setProjects(response.data);
            } catch (error) {
                console.log('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, []);

    const handleSave = async () => {
        if (!hours.trim()) {
            showSnackbar('Please enter hours coded', 'error');
            return;
        }

        const hoursNum = parseFloat(hours);
        if (isNaN(hoursNum) || hoursNum < 0 || hoursNum > 24) {
            showSnackbar('Hours must be a number between 0 and 24', 'error');
            return;
        }

        const problemsNum = parseInt(problemsSolved, 10) || 0;

        setLoading(true);
        try {
            const progressData = {
                hours: hoursNum,
                problemsSolved: problemsNum,
                techLearned: techStack, // Sending as array
                devLog: devLog.trim(),
                projectId: selectedProjectId,
            };

            if (editEntry) {
                await api.patch(`/progress/${editEntry._id}`, progressData);
            } else {
                await api.post('/progress', progressData);
            }

            showSnackbar(editEntry ? 'Progress updated!' : 'Progress saved!', 'success');
            navigation.goBack();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Failed to save progress', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{editEntry ? 'Edit Progress' : 'Add Progress'}</Text>
                <View style={{ width: 60 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>📝 Log Your Coding Session</Text>
                        <Text style={styles.formSubtitle}>
                            Track what you worked on today
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>⏱️ Hours Coded *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 3"
                                placeholderTextColor={COLORS.textMuted}
                                value={hours}
                                onChangeText={setHours}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {projects.length > 0 && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>📂 Select Project</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectPills}>
                                    {projects.map(project => (
                                        <TouchableOpacity
                                            key={project._id}
                                            style={[
                                                styles.projectPill,
                                                selectedProjectId === project._id && styles.projectPillSelected
                                            ]}
                                            onPress={() => setSelectedProjectId(project._id === selectedProjectId ? null : project._id)}
                                        >
                                            <Text style={[
                                                styles.projectPillText,
                                                selectedProjectId === project._id && styles.projectPillTextSelected
                                            ]}>
                                                {project.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>✅ Problems Solved</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 5"
                                placeholderTextColor={COLORS.textMuted}
                                value={problemsSolved}
                                onChangeText={setProblemsSolved}
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>💻 Technology Learned</Text>
                            <View style={styles.techInputContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                    placeholderTextColor={COLORS.textMuted}
                                    placeholder="e.g. React Native"
                                    value={techInput}
                                    onChangeText={setTechInput}
                                    onSubmitEditing={addTech}
                                />
                                <TouchableOpacity onPress={addTech} style={styles.addTechBtn}>
                                    <LinearGradient
                                        colors={GRADIENTS.primary}
                                        style={styles.addTechGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.addTechText}>+</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            {techStack.length > 0 && (
                                <View style={styles.chipsContainer}>
                                    {techStack.map((tech, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.chip}
                                            onPress={() => removeTech(tech)}
                                        >
                                            <LinearGradient
                                                colors={['rgba(108, 99, 255, 0.2)', 'rgba(90, 82, 213, 0.1)']}
                                                style={styles.chipGradient}
                                            >
                                                <Text style={styles.chipText}>{tech}</Text>
                                                <Text style={styles.chipClose}>✕</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>📝 What did you code today? (Dev Log)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="e.g. Built Pomodoro timer and fixed API bug"
                                placeholderTextColor={COLORS.textMuted}
                                value={devLog}
                                onChangeText={setDevLog}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={GRADIENTS.accent}
                                style={styles.saveButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.dark} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Progress</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingTop: 56,
        paddingBottom: 16,
    },
    backBtn: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: 15,
    },
    techInputContainer: { flexDirection: 'row', alignItems: 'center' },
    addTechBtn: { height: 48, width: 48, marginLeft: -1 },
    addTechGradient: { flex: 1, borderTopRightRadius: 12, borderBottomRightRadius: 12, justifyContent: 'center', alignItems: 'center' },
    addTechText: { color: COLORS.text, fontSize: 24, fontWeight: '300' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    chip: { marginRight: 8, marginBottom: 8, borderRadius: 8, overflow: 'hidden' },
    chipGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(108, 99, 255, 0.3)', borderRadius: 8 },
    chipText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
    chipClose: { color: COLORS.textMuted, fontSize: 12, marginLeft: 8, fontWeight: 'bold' },
    textArea: {
        minHeight: 100,
    },
    saveButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        elevation: 4,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveButtonText: {
        color: COLORS.dark,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    projectPills: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    projectPill: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
    },
    projectPillSelected: {
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        borderColor: COLORS.primary,
    },
    projectPillText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    projectPillTextSelected: {
        color: COLORS.text,
        fontWeight: '700',
    },
});

export default AddProgressScreen;
