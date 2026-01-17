import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Your main entry points */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />

        {/* Replace (tabs) with the actual dashboard path */}
        <Stack.Screen name="dashboard" />

        {/* Other screens */}
        <Stack.Screen name="signup" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="ExplorePatients" />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  );
}