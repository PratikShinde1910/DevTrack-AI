import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
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
import ProjectCard from '../components/ProjectCard';
import { useSnackbar } from '../context/SnackbarContext';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const ProjectsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showSnackbar } = useSnackbar();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [techStack, setTechStack] = useState([]);
    const [techInput, setTechInput] = useState('');
    const [github, setGithub] = useState('');
    const [progress, setProgress] = useState('');
    const [icon, setIcon] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setIcon(result.assets[0].uri);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.log('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProjects();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProjects();
        setRefreshing(false);
    };

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

    const handleCreateProject = async () => {
        if (!name.trim()) {
            showSnackbar('Project Name is required', 'error');
            return;
        }

        setCreating(true);
        try {
            let response;

            if (icon) {
                const formData = new FormData();
                formData.append('name', name.trim());
                formData.append('description', description.trim());
                formData.append('techStack', JSON.stringify(techStack));
                formData.append('github', github.trim());
                formData.append('progress', parseInt(progress, 10) || 0);

                // Infer the type from the file extension
                const filename = icon.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('icon', {
                    uri: icon,
                    name: filename,
                    type,
                });

                response = await api.post('/projects', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                const projectData = {
                    name: name.trim(),
                    description: description.trim(),
                    techStack: techStack,
                    github: github.trim(),
                    progress: parseInt(progress, 10) || 0,
                };
                response = await api.post('/projects', projectData);
            }

            showSnackbar('Project created!', 'success');
            setModalVisible(false);
            resetForm();
            fetchProjects();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Failed to create project', 'error');
        } finally {
            setCreating(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setTechStack([]);
        setTechInput('');
        setGithub('');
        setProgress('');
        setIcon(null);
    };

    const handleCancel = () => {
        setModalVisible(false);
        resetForm();
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚀</Text>
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptySubtitle}>
                Add your first project to start tracking your time and progress!
            </Text>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={GRADIENTS.background} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Projects</Text>
                <Text style={styles.headerSubtitle}>
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'} active
                </Text>
            </View>

            <FlatList
                data={projects}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ProjectCard
                        project={item}
                        onPress={() => navigation.navigate('ProjectDetails', { project: item })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            />

            {/* FAB */}
            <View style={[styles.fabContainer, { bottom: 85 + (insets.bottom || 0) }]}>
                <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        style={styles.fab}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.fabIcon}>+</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Create Project Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={handleCancel}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>✨ New Project</Text>
                                <TouchableOpacity onPress={handleCancel}>
                                    <Text style={styles.closeBtn}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.iconUploadContainer}>
                                    <TouchableOpacity onPress={pickImage} style={styles.iconUploadBtn}>
                                        {icon ? (
                                            <Image source={{ uri: icon }} style={styles.iconPreview} />
                                        ) : (
                                            <View style={styles.iconPlaceholder}>
                                                <Text style={styles.iconPlaceholderText}>📸</Text>
                                                <Text style={styles.iconUploadText}>Upload Icon</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Name *</Text>
                                    <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} placeholder="e.g. DevTrack AI" value={name} onChangeText={setName} />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Description</Text>
                                    <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} placeholder="App to track coding progress..." value={description} onChangeText={setDescription} />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Tech Stack</Text>
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

                                <View style={styles.rowInputs}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                        <Text style={styles.inputLabel}>Current Progress (%)</Text>
                                        <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} placeholder="0" value={progress} onChangeText={setProgress} keyboardType="number-pad" />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>GitHub URL</Text>
                                    <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} placeholder="https://github.com/..." value={github} onChangeText={setGithub} autoCapitalize="none" keyboardType="url" />
                                </View>

                                <TouchableOpacity onPress={handleCreateProject} disabled={creating}>
                                    <LinearGradient colors={GRADIENTS.accent} style={styles.createBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        {creating ? <ActivityIndicator color={COLORS.dark} /> : <Text style={styles.createBtnText}>Create Project</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text },
    headerSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
    listContent: { paddingHorizontal: 16, paddingBottom: 120, flexGrow: 1 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
    fabContainer: { position: 'absolute', right: 20, zIndex: 10 },
    fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
    fabIcon: { fontSize: 28, color: COLORS.text, fontWeight: '300' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.darkLight, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
    closeBtn: { fontSize: 24, color: COLORS.textMuted, padding: 4 },
    iconUploadContainer: { alignItems: 'center', marginBottom: 24 },
    iconUploadBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    iconPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    iconPlaceholderText: { fontSize: 32, marginBottom: 4 },
    iconUploadText: { fontSize: 10, color: COLORS.primary, fontWeight: '600', textTransform: 'uppercase' },
    iconPreview: { width: '100%', height: '100%' },
    inputGroup: { marginBottom: 16 },
    rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
    inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.text, fontSize: 15 },
    techInputContainer: { flexDirection: 'row', alignItems: 'center' },
    addTechBtn: { height: 48, width: 48, marginLeft: -1 },
    addTechGradient: { flex: 1, borderTopRightRadius: 12, borderBottomRightRadius: 12, justifyContent: 'center', alignItems: 'center' },
    addTechText: { color: COLORS.text, fontSize: 24, fontWeight: '300' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    chip: { marginRight: 8, marginBottom: 8, borderRadius: 8, overflow: 'hidden' },
    chipGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(108, 99, 255, 0.3)', borderRadius: 8 },
    chipText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
    chipClose: { color: COLORS.textMuted, fontSize: 12, marginLeft: 8, fontWeight: 'bold' },
    createBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    createBtnText: { color: COLORS.dark, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});

export default ProjectsScreen;
