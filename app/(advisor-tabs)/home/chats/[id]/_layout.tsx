import { Header } from "@/app/_layout";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { useGetChatsQuery } from "@/features/chats/api";
import { setActiveChat } from "@/features/chats/slice";
import { Chat } from "@/features/chats/types";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { act, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ChatHeader = ({ chat }: { chat: Chat }) => {
  const router = useRouter();

  const currentUser = useAppSelector((state) => state.auth.user);
  const onlineUsers = useAppSelector((state) => state.chats.onlineUsers);

  const getChatPartner = () => {
    if (chat.type === "ONE_ON_ONE") {
      const partner = chat.participants.find(
        (p) =>
          p.studentId !== currentUser?.id && p.advisorId !== currentUser?.id
      );
      return { ...partner, ...partner?.student, ...partner?.advisor };
    }
    return null;
  };

  const chatPartner = getChatPartner();

  const isOnline = chatPartner && onlineUsers[chatPartner.id!];

  const getName = () => {
    if (chat.type === "GROUP") {
      return chat.name;
    }
    if (chatPartner) {
      return `${chatPartner.firstName} ${chatPartner.lastName}`;
    }
    return "One-on-One Chat";
  };

  const getAvatar = () => {
    if (chat.chatImage) {
      return chat.chatImage;
    }

    if (chat.type === "GROUP") {
      return `/assets/images/society-placeholder.png`;
    }

    if (chatPartner) {
      return chatPartner.avatar;
    }
    return "https://github.com/shadcn.png";
  };

  const getFallback = () => {
    if (chat.type === "GROUP" && chat.name) {
      return chat.name.substring(0, 2).toUpperCase();
    }
    if (chatPartner) {
      return `${chatPartner.firstName?.[0] || ""}${
        chatPartner.lastName?.[0] || ""
      }`;
    }
    return "??";
  };

  const getGroupMembersText = () => {
    const memberNames = chat.participants
      .map((p) => {
        const user = p.student || p.advisor;
        if (user?.id === currentUser?.id) {
          return "You";
        }
        return user?.firstName;
      })
      .filter(Boolean) as string[];

    if (memberNames.length > 3) {
      return `${memberNames.slice(0, 3).join(", ")} and ${
        memberNames.length - 3
      } more`;
    }
    return memberNames.join(", ");
  };

  return (
    <View
      className={cn(
        "flex-row items-center px-4 py-3 bg-white border-b border-neutral-300"
      )}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="mr-3 p-2 -ml-2"
        activeOpacity={0.7}
      >
        <ArrowLeft size={20} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(advisor-tabs)/home/chats/[id]/chat-detail",
            params: { id: chat.id },
          })
        }
        className="flex-1 gap-3 items-center flex-row"
      >
        <Avatar className="w-12 h-12">
          <AvatarFallbackText>{getFallback()}</AvatarFallbackText>
          <AvatarImage source={{ uri: getAvatar() }} alt={getName()} />
        </Avatar>
        <View className="flex-1">
          <Text
            className="font-medium text-base flex-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getName()}
          </Text>
          {chat.type === "ONE_ON_ONE" ? (
            <View className="flex-row gap-1 items-center">
              <View
                className={`size-2 rounded-full ${
                  isOnline ? "bg-success-400" : "bg-neutral-500"
                }`}
              />
              <Text className="text-sm">{isOnline ? "Online" : "Offline"}</Text>
            </View>
          ) : (
            <Text className="text-sm" numberOfLines={1}>
              {getGroupMembersText()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function ChatViewLayout() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const { isSuccess, isFetching } = useGetChatsQuery();
  const { activeChat } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isSuccess && !isFetching) {
      dispatch(setActiveChat(chatId));
    }
  }, [chatId, dispatch, isSuccess, isFetching]);

  if (!activeChat) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <ChatHeader chat={activeChat} />,
        }}
      />
      <Stack.Screen
        name="chat-detail"
        options={{
          header: () => <Header title="Chat Detail" backButton />,
        }}
      />
      <Stack.Screen
        name="add-members"
        options={{
          header: () => <Header title="Add Members" backButton />,
        }}
      />
    </Stack>
  );
}
