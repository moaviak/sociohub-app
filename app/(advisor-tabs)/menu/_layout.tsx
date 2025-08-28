import { Header } from "@/app/_layout";
import { Stack } from "expo-router";

export default function MenuLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ header: () => <Header title="Menu Options" /> }}
      />
      <Stack.Screen
        name="announcements"
        options={{ header: () => <Header title="Announcements" backButton /> }}
      />
      <Stack.Screen
        name="create-post"
        options={{
          header: () => <Header title="Create New Post" backButton />,
        }}
      />
      <Stack.Screen
        name="to-do"
        options={{
          header: () => <Header title="To-Do List" backButton />,
        }}
      />
      <Stack.Screen
        name="socio-bot"
        options={{
          header: () => <Header title="SocioBot" backButton />,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
