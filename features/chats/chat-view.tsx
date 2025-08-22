import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { chatsApi, useGetMessagesByChatIdQuery } from "./api";
import { useEffect } from "react";
import { markChatAsRead } from "./slice";
import { Input, InputField } from "@/components/ui/input";
import { MessageInput } from "./components/message-input";
import { MessageList } from "./components/message-list";

const ChatView = ({ chatId }: { chatId: string }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { activeChat } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();

  const { isFetching: isLoading } = useGetMessagesByChatIdQuery(chatId, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (activeChat?.id) {
      dispatch(markChatAsRead(activeChat.id));
      dispatch(chatsApi.endpoints.markChatAsRead.initiate(activeChat.id));
    }
  }, [activeChat?.id, dispatch]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text>Messages Loading...</Text>
      </View>
    );
  }

  const currentSender = activeChat?.participants.find(
    (participant) =>
      participant.advisor?.id === currentUser?.id ||
      participant.student?.id === currentUser?.id
  );

  return (
    <View className="flex-1 justify-between">
      <MessageList
        chatId={chatId}
        isLoading={isLoading}
        messages={activeChat?.messages || []}
      />
      <MessageInput chatId={chatId} currentSender={currentSender!} />
    </View>
  );
};

export default ChatView;
