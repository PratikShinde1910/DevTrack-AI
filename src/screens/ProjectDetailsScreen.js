import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const ProjectDetailsScreen = ({ route, navigation }) => {
    // The project object is passed from ProjectsScreen via navigation route params
    const { project } = route.params;

    const [localProject, setLocalProject] = useState(project);
    const { _id, name, description, techStack, progress, github, demoUrl, iconUrl, notes } = localProject;

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Add Note Modal State
    const [addNoteVisible, setAddNoteVisible] = useState(false);
    const [addingNote, setAddingNote] = useState(false);
    const [newNote, setNewNote] = useState('');

    // Edit Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [editName, setEditName] = useState(name);
    const [editDescription, setEditDescription] = useState(description);
    const [editTechStack, setEditTechStack] = useState(techStack ? techStack.join(', ') : '');
    const [editProgress, setEditProgress] = useState(progress ? progress.toString() : '0');
    const [editNotes, setEditNotes] = useState(notes ? notes.join('\n') : '');
    const [editIcon, setEditIcon] = useState(iconUrl);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setEditIcon(result.assets[0].uri);
        }
    };

    const handleUpdateProject = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Project Name is required');
            return;
        }

        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('name', editName.trim());
            formData.append('description', editDescription.trim());
            formData.append('techStack', JSON.stringify(editTechStack.split(',').map(t => t.trim()).filter(Boolean)));
            formData.append('progress', parseInt(editProgress, 10) || 0);

            // Clean up notes
            const parsedNotes = editNotes.split('\n').map(n => n.trim()).filter(Boolean);
            formData.append('notes', JSON.stringify(parsedNotes));

            if (editIcon && editIcon !== iconUrl) {
                const filename = editIcon.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('icon', {
                    uri: editIcon,
                    name: filename,
                    type,
                });
            }

            const response = await api.patch(`/projects/${_id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Project updated successfully!');
            setLocalProject(response.data);
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update project');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            Alert.alert('Error', 'Please enter a note');
            return;
        }

        setAddingNote(true);
        try {
            const formData = new FormData();

            // Append all existing project data so we don't accidentally wipe it
            formData.append('name', name);
            if (description) formData.append('description', description);
            if (techStack && techStack.length > 0) formData.append('techStack', JSON.stringify(techStack));
            formData.append('progress', progress || 0);

            // Combine old notes with the new note
            const updatedNotes = [...(notes || []), newNote.trim()];
            formData.append('notes', JSON.stringify(updatedNotes));

            const response = await api.patch(`/projects/${_id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Note added!');
            setLocalProject(response.data);

            // Reset state
            setAddNoteVisible(false);
            setNewNote('');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add note');
        } finally {
            setAddingNote(false);
        }
    };

    const openLink = (url) => {
        if (url) {
            Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
        }
    };

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Project Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.sectionCard}>
                    <View style={styles.titleHeader}>
                        {iconUrl ? (
                            <Image source={{ uri: iconUrl }} style={styles.largeIcon} />
                        ) : (
                            <View style={styles.largeIconPlaceholder}>
                                <Text style={styles.largeIconPlaceholderText}>{name.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <Text style={styles.projectName}>{name}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressTextRow}>
                            <Text style={styles.progressPercent}>{progress || 0}% Complete</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <LinearGradient
                                colors={GRADIENTS.primary}
                                style={[styles.progressBarFill, { width: `${progress || 0}%` }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </View>
                    </View>
                </View>

                {/* Information Section */}
                <View style={styles.sectionCard}>
                    <TouchableOpacity
                        style={styles.descriptionHeaderRow}
                        onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.sectionTitle}>📝 Description</Text>
                        {description && description.length > 0 && (
                            <Ionicons
                                name={isDescriptionExpanded ? "chevron-up" : "chevron-down"}
                                size={22}
                                color={COLORS.primary}
                            />
                        )}
                    </TouchableOpacity>

                    {description && description.length > 0 ? (
                        <Text style={styles.descriptionText} numberOfLines={isDescriptionExpanded ? undefined : 1}>
                            {description}
                            {!isDescriptionExpanded && "..."}
                        </Text>
                    ) : (
                        <Text style={styles.descriptionText}>No description provided for this project.</Text>
                    )}

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>💻 Tech Stack</Text>
                    {techStack && techStack.length > 0 ? (
                        <View style={styles.techStackContainer}>
                            {techStack.map((tech, index) => (
                                <View key={index} style={styles.techBadge}>
                                    <Text style={styles.techText}>{tech}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.descriptionText}>No tech stack specified.</Text>
                    )}

                    <View style={styles.notesHeaderRow}>
                        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>📌 Notes</Text>
                        <TouchableOpacity onPress={() => setAddNoteVisible(true)} style={styles.addNoteBtn}>
                            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {notes && notes.length > 0 ? (
                        <View style={styles.notesContainer}>
                            {notes.map((note, index) => (
                                <View key={index} style={styles.noteRow}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.noteText}>{note}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.descriptionText}>No notes added yet.</Text>
                    )}
                </View>

                {/* Links Section */}
                {(github || demoUrl) && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>🔗 Links</Text>

                        {github && (
                            <TouchableOpacity style={styles.linkRow} onPress={() => openLink(github)}>
                                <Text style={styles.linkIcon}>🐙</Text>
                                <View style={styles.linkTexts}>
                                    <Text style={styles.linkTitle}>GitHub Repository</Text>
                                    <Text style={styles.linkUrl} numberOfLines={1}>{github}</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {demoUrl && (
                            <TouchableOpacity style={[styles.linkRow, github && { marginTop: 16 }]} onPress={() => openLink(demoUrl)}>
                                <Text style={styles.linkIcon}>🌐</Text>
                                <View style={styles.linkTexts}>
                                    <Text style={styles.linkTitle}>Live Demo</Text>
                                    <Text style={styles.linkUrl} numberOfLines={1}>{demoUrl}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}



                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add Note Modal */}
            <Modal visible={addNoteVisible} transparent animationType="slide" onRequestClose={() => setAddNoteVisible(false)}>
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', paddingHorizontal: 20 }}>
                        <View style={[styles.modalContent, { maxHeight: 'auto' }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>➕ Add Note</Text>
                                <TouchableOpacity onPress={() => setAddNoteVisible(false)}>
                                    <Text style={styles.closeBtn}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                                    multiline
                                    placeholderTextColor={COLORS.textMuted}
                                    placeholder="Type your note here..."
                                    value={newNote}
                                    onChangeText={setNewNote}
                                    autoFocus
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddNoteVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleAddNote} disabled={addingNote} style={{ flex: 1 }}>
                                    <LinearGradient colors={GRADIENTS.accent} style={[styles.updateBtn, { marginTop: 0 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        {addingNote ? <ActivityIndicator color={COLORS.dark} /> : <Text style={styles.updateBtnText}>Save</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Edit Project Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>✏️ Edit Project</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeBtn}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.iconUploadContainer}>
                                    <TouchableOpacity onPress={pickImage} style={styles.iconUploadBtn}>
                                        {editIcon ? (
                                            <Image source={{ uri: editIcon }} style={styles.iconPreview} />
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
                                    <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} value={editName} onChangeText={setEditName} />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Description</Text>
                                    <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} value={editDescription} onChangeText={setEditDescription} />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Notes (separate by new line)</Text>
                                    <TextInput style={[styles.input, { minHeight: 80 }]} multiline placeholderTextColor={COLORS.textMuted} placeholder="• Implement authentication" value={editNotes} onChangeText={setEditNotes} />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Tech Stack (comma separated)</Text>
                                    <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} value={editTechStack} onChangeText={setEditTechStack} />
                                </View>

                                <View style={styles.rowInputs}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                        <Text style={styles.inputLabel}>Current Progress (%)</Text>
                                        <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} placeholder="0" value={editProgress} onChangeText={setEditProgress} keyboardType="number-pad" />
                                    </View>
                                </View>

                                <TouchableOpacity onPress={handleUpdateProject} disabled={updating}>
                                    <LinearGradient colors={GRADIENTS.accent} style={styles.updateBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        {updating ? <ActivityIndicator color={COLORS.dark} /> : <Text style={styles.updateBtnText}>Save Changes</Text>}
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
    container: {
        flex: 1,
    },
    headerBar: {
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
    editBtn: {
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
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    sectionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    titleHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    largeIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    largeIconPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.4)',
    },
    largeIconPlaceholderText: {
        fontSize: 40,
        fontWeight: '900',
        color: COLORS.primary,
    },
    projectName: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    progressContainer: {
        width: '100%',
    },
    progressTextRow: {
        marginBottom: 8,
    },
    progressPercent: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    progressBarBackground: {
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    descriptionText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    descriptionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    techStackContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    techBadge: {
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.3)',
    },
    techText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '700',
    },
    notesContainer: {
        marginTop: 4,
    },
    noteRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        fontSize: 16,
        color: COLORS.primary,
        lineHeight: 24,
        marginRight: 8,
    },
    noteText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 24,
        flex: 1,
    },
    notesHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    addNoteBtn: {
        padding: 4,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    linkIcon: {
        fontSize: 28,
        marginRight: 16,
    },
    linkTexts: {
        flex: 1,
    },
    linkTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    linkUrl: {
        fontSize: 13,
        color: COLORS.primary,
    },
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
    updateBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    updateBtnText: { color: COLORS.dark, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
    modalActions: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
    cancelBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cancelBtnText: { color: COLORS.text, fontSize: 17, fontWeight: '600' }
});

export default ProjectDetailsScreen;
