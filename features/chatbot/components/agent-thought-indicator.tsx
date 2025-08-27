import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const AgentThoughtIndicator = ({
  agentThought,
}: {
  agentThought: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getThoughtIcon = (type: string, status: string) => {
    if (status === "error") return AlertTriangle;
    switch (type) {
      case "reasoning":
        return Brain;
      case "tool_call":
        return Zap;
      case "tool_result":
        return CheckCircle;
      case "final_answer":
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "thinking":
        return "#3b82f6";
      case "executing":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "thinking":
        return { borderColor: "#bfdbfe", backgroundColor: "#eff6ff" };
      case "executing":
        return { borderColor: "#fed7aa", backgroundColor: "#fffbeb" };
      case "completed":
        return { borderColor: "#a7f3d0", backgroundColor: "#ecfdf5" };
      case "error":
        return { borderColor: "#fecaca", backgroundColor: "#fef2f2" };
      default:
        return { borderColor: "#d1d5db", backgroundColor: "#f9fafb" };
    }
  };

  const IconComponent = getThoughtIcon(agentThought.type, agentThought.status);
  const statusColor = getStatusColor(agentThought.status);
  const borderStyle = getBorderColor(agentThought.status);

  return (
    <View style={{ alignSelf: "flex-start", marginVertical: 4 }}>
      <View
        style={{
          maxWidth: "85%",
          borderRadius: 12,
          borderWidth: 1,
          ...borderStyle,
        }}
      >
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            minHeight: 32,
          }}
        >
          <IconComponent size={16} color={statusColor} />
          <Text
            style={{
              marginLeft: 8,
              color: statusColor,
              fontSize: 14,
              fontWeight: "500",
              flex: 1,
            }}
          >
            {agentThought.title}
          </Text>
          {agentThought.toolName && (
            <View
              style={{
                backgroundColor: "#f3f4f6",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: "#6b7280", fontSize: 12 }}>
                {agentThought.toolName}
              </Text>
            </View>
          )}
          {agentThought.description && (
            <ChevronRight
              size={16}
              color="#9ca3af"
              style={{
                marginLeft: 4,
                transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
              }}
            />
          )}
        </TouchableOpacity>

        {isExpanded && agentThought.description && (
          <View
            style={{
              paddingHorizontal: 12,
              paddingBottom: 8,
              paddingTop: 4,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <Text
              style={{
                color: "#374151",
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {agentThought.description}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
