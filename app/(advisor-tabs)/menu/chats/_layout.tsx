import { Header } from "@/app/_layout";
import { Icon } from "@/components/ui/icon";
import { Stack } from "expo-router";
import { Edit } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export default function ChatsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <Header title="Chats" backButton>
              <TouchableOpacity style={{ marginRight: 12 }}>
                <Icon as={Edit} className="text-primary-500" size="xl" />
              </TouchableOpacity>
            </Header>
          ),
        }}
      />
    </Stack>
  );
}
