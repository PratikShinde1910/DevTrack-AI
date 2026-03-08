import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AddProgressScreen from '../screens/AddProgressScreen';
import CreateNewPasswordScreen from '../screens/CreateNewPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FocusTimerScreen from '../screens/FocusTimerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LoginScreen from '../screens/LoginScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import authEvents, { AUTH_LOGOUT } from '../utils/authEvents';
import { COLORS } from '../utils/constants';

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        fontSize: 48,
    },
    tabBar: {
        backgroundColor: COLORS.card,
        borderTopWidth: 0,
        height: 85,
        paddingBottom: 24,
        paddingTop: 12,
        position: 'absolute',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        width: 80,
    },
    tabItemFocused: {},
    tabLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 6,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    tabLabelFocused: {
        color: COLORS.primary,
        fontWeight: '800',
    },
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ iconName, label, focused }) => (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
        <Ionicons
            name={iconName}
            size={24}
            color={focused ? COLORS.primary : COLORS.textMuted}
        />
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
);

// Projects Stack (Maintains Tab Bar)
const ProjectsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProjectsList" component={ProjectsScreen} />
        <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
    </Stack.Navigator>
);

// Bottom Tab Navigator for main app
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
        }}
    >
        <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon iconName={focused ? "home" : "home-outline"} label="Home" focused={focused} />
                ),
            }}
        />
        <Tab.Screen
            name="Projects"
            component={ProjectsStack}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon iconName={focused ? "folder" : "folder-outline"} label="Projects" focused={focused} />
                ),
            }}
        />
        <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon iconName={focused ? "document-text" : "document-text-outline"} label="History" focused={focused} />
                ),
            }}
        />
        <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon iconName={focused ? "settings" : "settings-outline"} label="Settings" focused={focused} />
                ),
            }}
        />
    </Tab.Navigator>
);

// Auth Stack
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
    </Stack.Navigator>
);

import AppOriginScreen from '../screens/AppOriginScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

// App Stack (after login)
const AppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
            name="AddProgress"
            component={AddProgressScreen}
            options={{ presentation: 'modal' }}
        />
        <Stack.Screen
            name="FocusTimer"
            component={FocusTimerScreen}
            options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
            name="Progress"
            component={ProgressScreen}
        />
        <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ presentation: 'card' }}
        />
        <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicyScreen}
            options={{ presentation: 'card' }}
        />
        <Stack.Screen
            name="AppOrigin"
            component={AppOriginScreen}
            options={{ presentation: 'card' }}
        />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { isAuthenticated, loading, logout } = useAuth();

    useEffect(() => {
        const unsubscribe = authEvents.on(AUTH_LOGOUT, () => {
            logout();
        });
        return () => {
            authEvents.off(AUTH_LOGOUT, unsubscribe);
        };
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🚀</Text>
            </View>
        );
    }

    return isAuthenticated ? <AppStack /> : <AuthStack />;
};


export default AppNavigator;
