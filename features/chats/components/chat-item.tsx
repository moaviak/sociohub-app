import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Chat } from "../types";
import { View, Text, TouchableOpacity } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { cn, formatTimeShort } from "@/lib/utils";
import { File, Image, Video } from "lucide-react-native";
import { useState } from "react";
import { set } from "date-fns";
import { ChatOptions } from "./chat-options";

interface ChatItemProps {
  chat: Chat;
  onPress?: (chatId: string) => void;
}

export const ChatItem = ({ chat, onPress }: ChatItemProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const currentUser = useAppSelector((state) => state.auth.user);
  const typingUsers = useAppSelector(
    (state) => state.chats.typingUsers[chat.id]
  );
  const lastMessage = chat.messages?.[0];

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

  const isTyping = typingUsers && typingUsers.length > 0;

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

  const getTypingText = () => {
    if (!isTyping) {
      if (lastMessage?.attachments && !lastMessage.content) {
        const attachment =
          lastMessage.attachments[lastMessage.attachments.length - 1];
        if (attachment.type === "IMAGE" || attachment.type === "VIDEO") {
          return attachment.type === "IMAGE" ? (
            <View className="flex-row items-center gap-1">
              <Image size={14} color="#4b5563" />
              <Text className="text-gray-600 text-sm">Image</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1">
              <Video size={14} color="#4b5563" />
              <Text className="text-gray-600 text-sm">Video</Text>
            </View>
          );
        }

        if (attachment.type === "DOCUMENT") {
          return (
            <View className="flex-row items-center gap-1 flex-1">
              <File size={14} color="#4b5563" />
              <Text
                className="text-gray-600 text-sm flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {attachment.name}
              </Text>
            </View>
          );
        }
      }
      return (
        <Text
          className="text-gray-600 text-sm flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lastMessage?.content}
        </Text>
      );
    }

    if (chat.type === "GROUP") {
      const typingUserId = typingUsers[0];
      const typingParticipant = chat.participants.find(
        (p) => (p.student?.id || p.advisor?.id) === typingUserId
      );
      const user = typingParticipant?.student || typingParticipant?.advisor;
      if (user) {
        return (
          <Text className="text-primary-500 text-sm font-medium">
            {user.firstName} is typing...
          </Text>
        );
      }
    }

    // Fallback for ONE_ON_ONE or if user not found in group
    return (
      <Text className="text-primary-500 text-sm font-medium">typing...</Text>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => onPress?.(chat.id)}
        onLongPress={() => setShowOptions(true)}
        className={cn(
          "flex-row items-center px-4 py-2 gap-3 transition-colors",
          "active:bg-primary-600/10"
        )}
        activeOpacity={0.7}
      >
        <Avatar className="w-12 h-12">
          <AvatarFallbackText className="text-white">
            {getFallback()}
          </AvatarFallbackText>
          <AvatarImage source={{ uri: getAvatar() }} alt={getName()} />
        </Avatar>

        <View className="flex-1 gap-1">
          <View className="flex-row justify-between items-center gap-2">
            <Text
              className="font-medium text-base flex-1 mr-2"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getName()}
            </Text>
            {lastMessage && (
              <Text className="text-neutral-400 text-sm font-medium">
                {formatTimeShort(lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-2">{getTypingText()}</View>
            {chat.unreadCount > 0 && (
              <View className="bg-primary-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-medium">
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <ChatOptions chat={chat} open={showOptions} setOpen={setShowOptions} />
    </>
  );
};

// Skeleton component for loading state
ChatItem.Skeleton = function () {
  return (
    <View className="flex-row items-center px-4 py-2 gap-3">
      <View className="w-12 h-12 rounded-full bg-gray-300 animate-pulse" />
      <View className="flex-1 space-y-2">
        <View className="flex-row justify-between">
          <View className="w-22 h-5 bg-gray-300 rounded animate-pulse" />
          <View className="w-6 h-5 bg-gray-300 rounded animate-pulse" />
        </View>
        <View className="w-42 h-5 bg-gray-300 rounded animate-pulse" />
      </View>
    </View>
  );
};
