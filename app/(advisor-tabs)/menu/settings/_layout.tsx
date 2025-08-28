import { Header } from "@/app/_layout";
import { Stack } from "expo-router";

const SettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <Header title="Society Settings" backButton />,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          header: () => <Header title="Profile Settings" backButton />,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="members"
        options={{
          header: () => <Header title="Members & Requests" backButton />,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
};
export default SettingsLayout;
