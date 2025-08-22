import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useGetChatsQuery } from "./api";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { ChatItem } from "./components/chat-item";
import { useRouter } from "expo-router";
import { setActiveChat } from "./slice";
import { UserType } from "@/types";

const Chats = () => {
  const router = useRouter();
  const { chats } = useAppSelector((state) => state.chats);
  const { userType } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { isLoading } = useGetChatsQuery();
  const totalUnreadCount = chats.reduce(
    (acc, chat) => acc + chat.unreadCount,
    0
  );

  const handlePress = (chatId: string) => {
    router.push({
      pathname:
        userType === UserType.STUDENT
          ? "/(student-tabs)/chats/[id]"
          : ("/(advisor-tabs)/home/chats/[id]" as any),
      params: { id: chatId },
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="py-4"
      style={{ flex: 1 }}
    >
      <VStack space="lg" className="flex-1">
        {/* Search Input */}
        <Input
          size="lg"
          className="px-4 rounded-xl"
          style={{ marginHorizontal: 16 }}
        >
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField placeholder="Search messages..." />
        </Input>

        <HStack className="justify-between items-center px-6">
          <Text className="text-lg font-semibold">Messages</Text>
          {totalUnreadCount > 0 && !isLoading && (
            <Badge
              variant="outline"
              className="border-primary-400 rounded-md bg-primary-100/50"
            >
              <BadgeText className="text-xs text-primary-700 capitalize">
                {totalUnreadCount} new messages
              </BadgeText>
            </Badge>
          )}
        </HStack>
        <VStack space="sm">
          {isLoading ? (
            <View style={{ flex: 1 }} className="items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 mt-4">Loading chats...</Text>
            </View>
          ) : (
            chats.map((chat) => (
              <ChatItem key={chat.id} chat={chat} onPress={handlePress} />
            ))
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default Chats;
