import { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Mic, Paperclip, Send } from "lucide-react-native";
import { useSendMessageMutation } from "../api";
import { useAppDispatch } from "@/store/hooks";
import { addMessage, updateMessage } from "../slice";
import { Message, IUser } from "../types";
import { getSocket } from "@/lib/socket";
import { ChatAttachments } from "./chat-attachments";

interface MessageInputProps {
  chatId: string;
  currentSender: IUser;
}

export const MessageInput = ({ chatId, currentSender }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(20); // Default height
  const [sendMessageMutation] = useSendMessageMutation();
  const dispatch = useAppDispatch();
  const textInputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Check if input is multiline (height > 40 indicates more than one line)
  const isMultiline = inputHeight > 50;

  // Handle auto-resize for multiline input
  const handleContentSizeChange = (event: any) => {
    const { contentSize } = event.nativeEvent;
    const maxHeight = 120; // Maximum height (about 6 lines)
    const minHeight = 40; // Minimum height (1 line)

    const newHeight = Math.max(
      minHeight,
      Math.min(maxHeight, contentSize.height)
    );
    setInputHeight(newHeight);
  };

  const handleStopTyping = () => {
    getSocket()?.emit("stop-typing", { chatId });
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      const messageId = (Math.random() * 1000000000).toString();
      const newMessage: Message = {
        id: messageId,
        attachments: [],
        chatId,
        content: trimmedMessage,
        sender: currentSender,
        createdAt: new Date().toISOString(),
        readBy: [],
        senderId: currentSender.id,
        updatedAt: new Date().toISOString(),
        isSending: true,
        isError: false,
      };

      dispatch(
        addMessage({ message: newMessage, currentUserId: currentSender.id })
      );
      setMessage("");
      setInputHeight(40); // Reset height after sending
      handleStopTyping();

      try {
        await sendMessageMutation({
          chatId,
          content: trimmedMessage,
        }).unwrap();

        dispatch(
          updateMessage({
            id: messageId,
            chatId,
            updates: { isSending: false },
          })
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        dispatch(
          updateMessage({
            id: messageId,
            chatId,
            updates: { isError: true, isSending: false },
          })
        );

        // Optional: Show error alert
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    }
  };

  const handleInputChange = (text: string) => {
    setMessage(text);

    // Emit typing event
    getSocket()?.emit("typing", { chatId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(handleStopTyping, 3000); // 3 seconds
  };

  const handleMicPress = () => {
    // TODO: Implement voice recording functionality
    Alert.alert("Voice Message", "Voice message feature coming soon!");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleStopTyping();
    };
  }, []);

  const showSendButton = message.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="p-2 bg-white">
        <View
          className="flex-row gap-1 rounded-2xl border border-neutral-300 py-1 px-2"
          style={{
            borderRadius: 16,
            alignItems: isMultiline ? "flex-end" : "center",
          }}
        >
          <ChatAttachments currentSender={currentSender} />

          <TextInput
            ref={textInputRef}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={handleInputChange}
            onContentSizeChange={handleContentSizeChange}
            multiline
            numberOfLines={5}
            style={{
              height: inputHeight,
              maxHeight: 120,
              minHeight: 20,
            }}
            className="flex-1 bg-transparent text-base text-gray-900"
            textAlignVertical="top"
          />

          <View className="shrink-0 pb-1">
            {showSendButton ? (
              <TouchableOpacity
                onPress={handleSendMessage}
                className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100"
                activeOpacity={0.7}
              >
                <Send size={20} color="#218bff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleMicPress}
                className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100"
                activeOpacity={0.7}
              >
                <Mic size={20} color="#218bff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
