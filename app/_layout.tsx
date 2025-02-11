import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { PatientsProvider } from "../context/PatientsProvider";
import { TestsProvider } from "../context/TestsProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    MarkaziTextR: require("../assets/fonts/MarkaziText-Regular.ttf"),
    MarkaziTextM: require("../assets/fonts/MarkaziText-Medium.ttf"),
    MarkaziTextB: require("../assets/fonts/MarkaziText-Bold.ttf"),
    MarkaziTextS: require("../assets/fonts/MarkaziText-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PatientsProvider>
      <StatusBar style="dark" />
      <TestsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TestsProvider>
    </PatientsProvider>
  );
}
