import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const AddProgressScreen = ({ navigation, route }) => {
    const [hours, setHours] = useState('');
    const [problemsSolved, setProblemsSolved] = useState('');
    const [techLearned, setTechLearned] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const editEntry = route?.params?.entry;

    useEffect(() => {
        if (editEntry) {
            setHours(editEntry.hours?.toString() || '');
            setProblemsSolved(editEntry.problemsSolved?.toString() || '');
            setTechLearned(editEntry.techLearned || '');
            setNotes(editEntry.notes || '');
            setSelectedProjectId(editEntry.projectId);
        }
    }, [editEntry]);

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
            Alert.alert('Error', 'Please enter hours coded');
            return;
        }

        const hoursNum = parseFloat(hours);
        if (isNaN(hoursNum) || hoursNum < 0 || hoursNum > 24) {
            Alert.alert('Error', 'Hours must be a number between 0 and 24');
            return;
        }

        const problemsNum = parseInt(problemsSolved, 10) || 0;

        setLoading(true);
        try {
            const progressData = {
                hours: hoursNum,
                problemsSolved: problemsNum,
                techLearned: techLearned.trim(),
                notes: notes.trim(),
                projectId: selectedProjectId,
            };

            if (editEntry) {
                await api.patch(`/progress/${editEntry._id}`, progressData);
            } else {
                await api.post('/progress', progressData);
            }

            Alert.alert('Success', editEntry ? 'Progress updated!' : 'Progress saved!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to save progress'
            );
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
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., React Native"
                                placeholderTextColor={COLORS.textMuted}
                                value={techLearned}
                                onChangeText={setTechLearned}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>📋 Notes</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="What did you work on?"
                                placeholderTextColor={COLORS.textMuted}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
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
