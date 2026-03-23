import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import KeyboardScreen from './src/screens/KeyboardScreen';
import { ThemeProvider, useThemeManager } from './src/theme/ThemeManager';

function AppContent() {
  const { themeName } = useThemeManager();

  return (
    <>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardScreen />
    </>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ThemeProvider initialTheme={isDarkMode ? 'dark' : 'light'}>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
