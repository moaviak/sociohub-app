import { View } from "react-native";
import { ChatMessage } from "../types";
import Markdown from "react-native-markdown-display";
import { cn } from "@/lib/utils";

export const Message = ({ message }: { message: ChatMessage }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: message.isUser ? "flex-end" : "flex-start",
        marginVertical: 4,
      }}
    >
      <View
        className={cn(message.isUser ? "bg-primary-500" : "bg-neutral-200")}
        style={{
          maxWidth: "80%",
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
        }}
      >
        <Markdown
          style={{ body: { color: message.isUser ? "#fff" : "#1f2937" } }}
        >
          {message.text}
        </Markdown>
      </View>
    </View>
  );
};
