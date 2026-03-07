import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import CompactHistoryCard from '../components/CompactHistoryCard';
import api from '../services/api';
import { COLORS, GRADIENTS } from '../utils/constants';

const HistoryScreen = ({ navigation }) => {
    const [entries, setEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchEntries = async () => {
        try {
            const response = await api.get('/progress');
            // Sort by date descending
            const sorted = response.data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
            setEntries(sorted);
        } catch (error) {
            console.log('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEntries();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEntries();
        setRefreshing(false);
    };

    const handleDelete = (item) => {
        Alert.alert('Delete Entry', 'Are you sure you want to delete this log?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/progress/${item._id}`);
                        setEntries(entries.filter((e) => e._id !== item._id));
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete entry');
                    }
                },
            },
        ]);
    };

    const handleEdit = (item) => {
        navigation.navigate('AddProgress', { entry: item });
    };

    const formatDateLabel = (dateString) => {
        const d = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return '📅 Today';
        } else if (d.toDateString() === yesterday.toDateString()) {
            return '📅 Yesterday';
        } else {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            return `📅 ${d.toLocaleDateString('en-US', options)}`;
        }
    };

    const filteredEntries = useMemo(() => {
        if (!searchQuery) return entries;
        const query = searchQuery.toLowerCase();
        return entries.filter((item) => {
            const techMatch = item.techLearned?.toLowerCase().includes(query);
            const dateMatch = formatDateLabel(item.date || item.createdAt).toLowerCase().includes(query);
            return techMatch || dateMatch;
        });
    }, [searchQuery, entries]);

    const headerComponent = useMemo(() => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>History</Text>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search logs (tech, date)..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    ), [searchQuery]);

    const emptyComponent = useMemo(() => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>
                {searchQuery ? 'No Results Found' : 'No Entries Yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery
                    ? `We couldn't find any logs matching "${searchQuery}"`
                    : 'Start logging your coding progress to see your history here.'}
            </Text>
        </View>
    ), [searchQuery]);

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

            <SwipeListView
                data={filteredEntries}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={headerComponent}
                renderItem={({ item }) => (
                    <CompactHistoryCard
                        hours={item.hours}
                        problems={item.problemsSolved}
                        tech={item.techLearned}
                        dateLabel={formatDateLabel(item.date || item.createdAt)}
                    />
                )}
                renderHiddenItem={({ item }) => (
                    <View style={styles.rowBack}>
                        <View style={styles.backRight}>
                            <TouchableOpacity
                                style={[styles.backBtn, styles.editBtn]}
                                onPress={() => handleEdit(item)}
                            >
                                <Ionicons name="pencil" size={18} color="#A3A1FF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.backBtn, styles.deleteBtn]}
                                onPress={() => handleDelete(item)}
                            >
                                <Ionicons name="trash" size={18} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                rightOpenValue={-120}
                disableRightSwipe
                recalculateHiddenLayout={true}
                swipeToOpenPercent={10}
                stopRightSwipe={-140}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={emptyComponent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for tab bar
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 12,
        marginBottom: 12,
    },
    backRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        borderWidth: 1,
    },
    editBtn: {
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        borderColor: 'rgba(108, 99, 255, 0.3)',
    },
    deleteBtn: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
});

export default HistoryScreen;



