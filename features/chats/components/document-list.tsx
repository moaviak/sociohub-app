// components/DocumentList.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Download } from "lucide-react-native";
import { DocumentIcon } from "./document-icon";
import { Attachment } from "../types";
import { formatFileSize, downloadFile } from "@/lib/fileUtils";

interface DocumentListProps {
  attachments: Attachment[];
  isSender: boolean;
  onLongPress?: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  attachments,
  isSender,
  onLongPress,
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <View
      style={{
        alignSelf: "stretch",
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: "100%",
      }}
    >
      {attachments.map((attachment, index) => (
        <TouchableOpacity
          key={attachment.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: index < attachments.length - 1 ? 8 : 0,
            minHeight: 56,
          }}
          onPress={() =>
            downloadFile(attachment.url, attachment.name || "document")
          }
          onLongPress={onLongPress}
          activeOpacity={0.7}
          delayLongPress={500}
        >
          <DocumentIcon filename={attachment.name || "document"} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontWeight: "500",
                fontSize: 14,
                color: isSender ? "#FFFFFF" : "#171717",
                marginBottom: 2,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {attachment.name || "Document"}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: isSender ? "rgba(255, 255, 255, 0.8)" : "#6B7280",
              }}
              numberOfLines={1}
            >
              {attachment.type} • {formatFileSize(attachment.size)}
            </Text>
          </View>
          <View
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
            }}
          >
            <Download
              size={18}
              color={isSender ? "rgba(255, 255, 255, 0.9)" : "#6B7280"}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
