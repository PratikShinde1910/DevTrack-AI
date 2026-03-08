import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../src/context/AuthContext';
import { FocusTimerProvider } from '../src/context/FocusTimerContext';
import { SnackbarProvider } from '../src/context/SnackbarContext';
import AppNavigator from '../src/navigation/AppNavigator';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <FocusTimerProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </FocusTimerProvider>
      </SnackbarProvider>
    </AuthProvider>
  );
}
