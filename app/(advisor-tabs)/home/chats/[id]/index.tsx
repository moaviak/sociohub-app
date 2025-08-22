import ChatView from "@/features/chats/chat-view";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const ChatViewScreen = () => {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1 }} className="bg-white">
      <ChatView chatId={chatId} />
    </View>
  );
};

export default ChatViewScreen;
