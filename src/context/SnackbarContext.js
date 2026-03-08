import { createContext, useContext, useState } from 'react';
import AppSnackbar from '../components/AppSnackbar';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: '',
        type: 'success', // 'success' or 'error'
    });

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ visible: true, message, type });
    };

    const hideSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, visible: false }));
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <AppSnackbar
                visible={snackbar.visible}
                message={snackbar.message}
                type={snackbar.type}
                onHide={hideSnackbar}
            />
        </SnackbarContext.Provider>
    );
};
