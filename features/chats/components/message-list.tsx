import React, { useEffect, useRef } from "react";
import { FlatList, View, Animated } from "react-native";
import { Message, IUser } from "../types";
import { MessagesGroup } from "./messages-group";
import { useAppSelector } from "@/store/hooks";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { TypingIndicator } from "@/components/typing-indicator";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  chatId: string;
}

export interface MessagesGroup {
  sender: IUser;
  messages: Message[];
}

const groupMessages = (messages: Message[]): MessagesGroup[] => {
  const groups: MessagesGroup[] = [];

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.sender.id === message.sender.id) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        sender: message.sender,
        messages: [message],
      });
    }
  }

  return groups;
};

export const MessageList = ({
  messages,
  chatId,
  isLoading,
}: MessageListProps) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const typingUsers = useAppSelector(
    (state) => state.chats.typingUsers[chatId]
  );
  const activeChat = useAppSelector((state) => state.chats.activeChat);
  const flatListRef = useRef<FlatList>(null);

  const messageGroups = groupMessages(messages);
  const isTyping = typingUsers && typingUsers.length > 0;

  const getTypingParticipant = (userId: string) => {
    return activeChat?.participants.find(
      (p) => p.studentId === userId || p.advisorId === userId
    );
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessageGroup = ({
    item,
    index,
  }: {
    item: MessagesGroup;
    index: number;
  }) => (
    <MessagesGroup
      key={`group-${index}`}
      messages={item.messages}
      sender={item.sender}
    />
  );

  const renderTypingIndicators = () => {
    if (!isTyping) return null;

    return typingUsers
      .filter((userId) => userId !== currentUser?.id)
      .map((userId) => {
        const typingParticipant = getTypingParticipant(userId);
        const typingUser =
          typingParticipant?.advisor || typingParticipant?.student;

        return (
          <View key={userId} className="flex-row gap-2 px-6 pb-4">
            <Avatar size="sm">
              <AvatarFallbackText className="text-white">
                {`${typingUser?.firstName?.[0] || ""}${
                  typingUser?.lastName?.[0] || ""
                }`}
              </AvatarFallbackText>
              <AvatarImage source={{ uri: typingUser?.avatar }} />
            </Avatar>
            <View className="space-y-0.5">
              <View className="px-4 py-2 rounded-lg bg-neutral-200 rounded-tl-none">
                <TypingIndicator />
              </View>
            </View>
          </View>
        );
      });
  };

  const keyExtractor = (item: MessagesGroup, index: number) =>
    `message-group-${index}`;

  return (
    <View className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={messageGroups}
        keyExtractor={keyExtractor}
        renderItem={renderMessageGroup}
        contentContainerStyle={{
          padding: 16,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
      />
      {renderTypingIndicators()}
    </View>
  );
};
