import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1a1a1a',
          headerBackTitle: '',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '400',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="messages" />
        <Stack.Screen name="add-app" />
        <Stack.Screen name="connect-app" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
