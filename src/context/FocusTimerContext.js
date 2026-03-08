import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import api from '../services/api';
import { useSnackbar } from './SnackbarContext';

const FocusTimerContext = createContext();

export const useFocusTimer = () => useContext(FocusTimerContext);

export const FocusTimerProvider = ({ children }) => {
    const { showSnackbar } = useSnackbar();

    // Current timer configurations
    const [durationMins, setDurationMins] = useState(25);
    const [sessionName, setSessionName] = useState('Focus Session');

    // Live ticking state
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    // Internal background sync tracking
    const [startTime, setStartTime] = useState(null);
    const [timerInitialized, setTimerInitialized] = useState(false);

    // Lifecycle: Load existing timer on App Startup
    useEffect(() => {
        loadTimerState();
    }, []);

    // Lifecycle: Ticking Logic
    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                const now = Date.now();
                const expectedTimeLeft = Math.max(0, (durationMins * 60) - Math.floor((now - startTime) / 1000));

                setTimeLeft(expectedTimeLeft);

                if (expectedTimeLeft <= 0) {
                    clearInterval(interval);
                    handleSessionComplete();
                }
            }, 1000);
        } else if (!isActive && startTime) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, startTime, durationMins]);

    // Handle AppState changes (returning from background)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active' && isActive) {
                syncTimerWithStorage();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [isActive]);

    const loadTimerState = async () => {
        try {
            const storedState = await AsyncStorage.getItem('@focus_timer_state');
            if (storedState) {
                const parsed = JSON.parse(storedState);

                setStartTime(parsed.startTime);
                setDurationMins(parsed.duration);
                setSessionName(parsed.sessionName);

                if (parsed.isRunning) {
                    const elapsedSecs = Math.floor((Date.now() - parsed.startTime) / 1000);
                    const remaining = Math.max(0, (parsed.duration * 60) - elapsedSecs);

                    setTimeLeft(remaining);

                    if (remaining > 0) {
                        setIsActive(true);
                    } else {
                        // Timer expired while app was dead
                        setTimeLeft(0);
                        setIsActive(false);
                        handlePendingCompletion(parsed.duration, parsed.sessionName);
                    }
                } else {
                    // Timer was explicitly paused or wasn't running
                    setTimeLeft(parsed.pausedTimeLeft || parsed.duration * 60);
                    setIsActive(false);
                }
            }
        } catch (e) {
            console.error('Error loading timer state', e);
        } finally {
            setTimerInitialized(true);
        }
    };

    const syncTimerWithStorage = async () => {
        if (!startTime) return;

        const elapsedSecs = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, (durationMins * 60) - elapsedSecs);

        setTimeLeft(remaining);
        if (remaining <= 0) {
            setIsActive(false);
            handleSessionComplete();
        }
    };

    const saveTimerState = async (updates = {}) => {
        try {
            const currentState = {
                startTime,
                duration: durationMins,
                sessionName,
                isRunning: isActive,
                pausedTimeLeft: timeLeft,
                ...updates
            };
            await AsyncStorage.setItem('@focus_timer_state', JSON.stringify(currentState));
        } catch (e) {
            console.error('Error saving timer state', e);
        }
    };

    const clearTimerState = async () => {
        try {
            await AsyncStorage.removeItem('@focus_timer_state');
        } catch (e) {
            console.error('Error clearing timer state', e);
        }
    };

    const startTimer = () => {
        if (timeLeft <= 0) return;

        let newStartTime;
        if (startTime) {
            // Resuming from pause
            const elapsedAlready = (durationMins * 60) - timeLeft;
            newStartTime = Date.now() - (elapsedAlready * 1000);
        } else {
            // Starting fresh
            newStartTime = Date.now();
        }

        setStartTime(newStartTime);
        setIsActive(true);
        saveTimerState({ startTime: newStartTime, isRunning: true });
    };

    const pauseTimer = () => {
        setIsActive(false);
        saveTimerState({ isRunning: false, pausedTimeLeft: timeLeft });
    };

    const resetTimer = () => {
        setIsActive(false);
        setStartTime(null);
        setTimeLeft(durationMins * 60);
        clearTimerState();
    };

    const handleSessionComplete = async () => {
        setIsActive(false);
        setStartTime(null);
        clearTimerState();

        try {
            await api.post('/api/focus', {
                duration: durationMins,
                sessionName,
            });
            showSnackbar(`${sessionName} completed 🎉\nYour session has been saved.`, 'success');
        } catch (error) {
            console.error(error);
            showSnackbar('Failed to save focus session to cloud.', 'error');
        }
    };

    // Edge case handler if timer completes fully while app is completely dead
    const handlePendingCompletion = async (dur, name) => {
        clearTimerState();
        try {
            await api.post('/api/focus', {
                duration: dur,
                sessionName: name,
            });
            showSnackbar(`${name} completed 🎉\nSession finished while you were away and was saved.`, 'success');
        } catch (error) {
            console.error('Error saving background-completed session', error);
        }
    };

    return (
        <FocusTimerContext.Provider value={{
            durationMins,
            setDurationMins,
            sessionName,
            setSessionName,
            timeLeft,
            setTimeLeft,
            isActive,
            startTimer,
            pauseTimer,
            resetTimer,
            timerInitialized
        }}>
            {children}
        </FocusTimerContext.Provider>
    );
};
