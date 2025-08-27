import { Send } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const MessageInput = ({
  onSendMessage,
  disabled = false,
}: {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const canSend = message.trim() && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="flex-row p-4 gap-3" style={{ alignItems: "flex-end" }}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask Assistant"
          multiline
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          style={{
            maxHeight: 120,
          }}
          editable={!disabled}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!canSend}
          style={{
            backgroundColor: canSend ? "#007AFF" : "#ccc",
            borderRadius: 20,
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
