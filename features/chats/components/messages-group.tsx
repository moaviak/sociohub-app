import React from "react";
import { View } from "react-native";
import { MessagesGroup as MessagesGroupProps } from "./message-list";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { MessageBubble } from "./message-bubble";

export const MessagesGroup: React.FC<MessagesGroupProps> = ({
  sender,
  messages,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const senderUser = sender.advisor || sender.student;
  const isSender = senderUser?.id === currentUser?.id;

  return (
    <View
      className={cn("w-full flex-row gap-2", isSender && "flex-row-reverse")}
    >
      <Avatar size="sm">
        <AvatarFallbackText className="text-white">
          {`${senderUser?.firstName?.[0] || ""}${
            senderUser?.lastName?.[0] || ""
          }`}
        </AvatarFallbackText>
        <AvatarImage source={{ uri: senderUser?.avatar }} />
      </Avatar>
      <View className="flex-1" style={{ gap: 2 }}>
        {messages.map((message, idx) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSender={isSender}
            isFirstInGroup={idx === 0}
          />
        ))}
      </View>
    </View>
  );
};
