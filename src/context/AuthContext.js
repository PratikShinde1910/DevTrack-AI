import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load persisted auth state on mount
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
            const storedUser = await AsyncStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.log('Error loading stored auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            const { token: newToken, refreshToken, user: newUser } = response.data;

            await AsyncStorage.setItem('token', newToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('user', JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, message };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: newToken, refreshToken, user: newUser } = response.data;

            await AsyncStorage.setItem('token', newToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('user', JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.log('Error during logout:', error);
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const response = await api.post('/auth/request-password-reset', { email });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to request reset';
            return { success: false, message };
        }
    };

    const verifyResetOtp = async (email, otp) => {
        try {
            const response = await api.post('/auth/verify-reset-otp', { email, otp });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid or expired OTP';
            return { success: false, message };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { email, otp, newPassword });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || 'Password reset failed';
            return { success: false, message };
        }
    };

    const updateUser = async () => {
        try {
            const response = await api.get('/api/users/me');
            const updatedUser = response.data;
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            console.log('Error refreshing user profile:', error);
            return { success: false };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!token,
                login,
                register,
                logout,
                requestPasswordReset,
                verifyResetOtp,
                resetPassword,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
