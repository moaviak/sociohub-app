import { Header } from "@/app/_layout";
import { Stack } from "expo-router";

export default function MenuLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="to-do"
        options={{
          header: () => <Header title="To-Do List" backButton />,
        }}
      />
    </Stack>
  );
}
