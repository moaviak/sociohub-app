// components/MessageDropdown.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Trash2 } from "lucide-react-native";
import { Message } from "../types";
import { format } from "date-fns";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MessageDropdownProps {
  message: Message;
  isSender: boolean;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete: (messageId: string) => void;
}

export const MessageDropdown: React.FC<MessageDropdownProps> = ({
  message,
  isSender,
  isVisible,
  position,
  onClose,
  onDelete,
}) => {
  // Calculate dropdown position to ensure it stays within screen bounds
  const dropdownWidth = 200;
  const dropdownHeight = 120;

  let adjustedX = position.x;
  let adjustedY = position.y;

  // Ensure dropdown doesn't go off right edge
  if (adjustedX + dropdownWidth > screenWidth - 20) {
    adjustedX = screenWidth - dropdownWidth - 20;
  }

  // Ensure dropdown doesn't go off bottom edge
  if (adjustedY + dropdownHeight > screenHeight - 20) {
    adjustedY = position.y - dropdownHeight - 10;
  }

  // Ensure dropdown doesn't go off left edge
  if (adjustedX < 20) {
    adjustedX = 20;
  }

  // Ensure dropdown doesn't go off top edge
  if (adjustedY < 20) {
    adjustedY = 20;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <View
            style={{
              position: "absolute",
              left: adjustedX,
              top: adjustedY,
              width: dropdownWidth,
              backgroundColor: "white",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Timestamp */}
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                {format(message.createdAt, "dd/MM/yyyy, hh:mm aa")}
              </Text>
            </View>

            {/* Delete Option */}
            {isSender && (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  gap: 12,
                }}
                onPress={() => {
                  onDelete(message.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#EF4444",
                    fontWeight: "500",
                  }}
                >
                  Delete Message
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
