import { Header } from "@/app/_layout";
import { Icon } from "@/components/ui/icon";
import NotificationIcon from "@/features/notifications/notification-icon";
import { Stack, useRouter } from "expo-router";
import { Bell, MessageCircleMore } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <View className="flex-row items-center p-4 bg-white border-b border-b-neutral-300 gap-6">
              <Text className="text-2xl font-bold font-heading ml-2 text-neutral-600 flex-1">
                Home
              </Text>
              <NotificationIcon />
              <TouchableOpacity
                onPress={() => router.push("/(advisor-tabs)/home/chats" as any)}
              >
                <Icon as={MessageCircleMore} size="xl" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          header: () => <Header title="Notifications" backButton />,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="chats"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
    </Stack>
  );
}
