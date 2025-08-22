// components/MessageBubble.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { AlertCircle } from "lucide-react-native";
import { Message } from "../types";
import { MediaCarousel } from "./media-carousel";
import { MediaGrid } from "./media-grid";
import { DocumentList } from "./document-list";
import { MessageDropdown } from "./message-dropdown";
import { useDeleteMessageMutation } from "../api";
import { useAppDispatch } from "@/store/hooks";
import { deleteMessage as deleteMessageFromState } from "../slice";

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  isFirstInGroup: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSender,
  isFirstInGroup,
  onDeleteMessage,
}) => {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const [deleteMessage] = useDeleteMessageMutation();
  const dispatch = useAppDispatch();

  const bubbleRef = useRef<View>(null);

  const mediaAttachments = message.attachments?.filter(
    (att) => att.type === "IMAGE" || att.type === "VIDEO"
  );
  const documentAttachments = message.attachments?.filter(
    (att) => att.type === "DOCUMENT"
  );

  const openCarousel = (index: number) => {
    setSelectedAttachmentIndex(index);
    setCarouselOpen(true);
  };

  const handleImageError = (attachment: any, error: any) => {
    console.error("Image load error for:", attachment.url, error);
    setImageLoadErrors((prev) => new Set(prev).add(attachment.id));
  };

  const handleImageLoad = (attachment: any) => {
    setImageLoadErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(attachment.id);
      return newSet;
    });
  };

  const handleLongPress = () => {
    if (bubbleRef.current) {
      bubbleRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          x: x + width / 2 - 100, // Center the dropdown horizontally
          y: y - 10, // Position above the bubble
        });
        setDropdownVisible(true);
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    dispatch(deleteMessageFromState({ messageId, chatId: message.chatId }));
    try {
      await deleteMessage(message.id).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <View
        style={{
          width: "100%",
          flexDirection: isSender ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: 8,
          justifyContent: "flex-start",
        }}
      >
        {message.isSending && (
          <View style={{ width: 16, height: 16 }}>
            <ActivityIndicator size={"small"} color="#6B7280" />
          </View>
        )}

        <Pressable
          ref={bubbleRef}
          onLongPress={handleLongPress}
          style={{
            maxWidth: "85%",
            borderRadius: 12,
            position: "relative",
            overflow: "hidden",
            backgroundColor: isSender ? "#3B82F6" : "#E5E5E5",
            borderTopRightRadius: isFirstInGroup && isSender ? 4 : 12,
            borderTopLeftRadius: isFirstInGroup && !isSender ? 4 : 12,
            alignSelf: "flex-start",
          }}
        >
          {/* Media Attachments Grid */}
          {mediaAttachments && (
            <MediaGrid
              attachments={mediaAttachments}
              onAttachmentPress={openCarousel}
              imageLoadErrors={imageLoadErrors}
              onImageError={handleImageError}
              onImageLoad={handleImageLoad}
              onLongPress={handleLongPress}
            />
          )}

          {/* Text Content */}
          {message.content && (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                paddingTop:
                  mediaAttachments && mediaAttachments.length > 0 ? 8 : 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: isSender ? "white" : "#171717",
                }}
              >
                {message.content}
              </Text>
            </View>
          )}

          {/* Document Attachments */}
          {documentAttachments && (
            <DocumentList
              attachments={documentAttachments}
              isSender={isSender}
              onLongPress={handleLongPress}
            />
          )}
        </Pressable>

        {message.isError && (
          <TouchableOpacity
            onPress={() => Alert.alert("Error", "Unable to send message")}
            activeOpacity={0.7}
          >
            <AlertCircle size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Media Carousel */}
      {mediaAttachments && (
        <MediaCarousel
          attachments={mediaAttachments}
          initialIndex={selectedAttachmentIndex}
          isOpen={carouselOpen}
          onClose={() => setCarouselOpen(false)}
        />
      )}

      {/* Message Dropdown */}
      <MessageDropdown
        message={message}
        isSender={isSender}
        isVisible={dropdownVisible}
        position={dropdownPosition}
        onClose={() => setDropdownVisible(false)}
        onDelete={handleDeleteMessage}
      />
    </>
  );
};
