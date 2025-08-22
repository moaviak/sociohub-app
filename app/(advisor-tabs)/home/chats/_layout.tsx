import { Header } from "@/app/_layout";
import { Icon } from "@/components/ui/icon";
import { Stack, useRouter } from "expo-router";
import { Edit } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export default function ChatsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <Header title="Chats" backButton>
              <TouchableOpacity
                style={{ marginRight: 12 }}
                onPress={() =>
                  router.push("/(advisor-tabs)/home/chats/new-message")
                }
              >
                <Icon as={Edit} className="text-primary-500" size="xl" />
              </TouchableOpacity>
            </Header>
          ),
        }}
      />
      <Stack.Screen
        name="new-message"
        options={{
          header: () => <Header title="New Message" backButton />,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="new-group"
        options={{
          header: () => <Header title="New Group Chat" backButton />,
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
