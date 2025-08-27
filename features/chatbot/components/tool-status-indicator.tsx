import { CheckCircle, Database, FileText, Search } from "lucide-react-native";
import { Text, View } from "react-native";

export const ToolStatusIndicator = ({ toolStatus }: { toolStatus: any[] }) => {
  const getToolIcon = (tool: string) => {
    switch (tool) {
      case "document_retrieval":
        return FileText;
      case "database_query":
        return Database;
      case "web_search":
        return Search;
      default:
        return FileText;
    }
  };

  const getToolMessage = (tool: string, status: string) => {
    const messages = {
      document_retrieval: {
        running: "Reading documents...",
        complete: "Documents analyzed",
      },
      database_query: {
        running: "Querying database...",
        complete: "Database query completed",
      },
      web_search: {
        running: "Searching the web...",
        complete: "Search results retrieved",
      },
    };

    return (
      messages[tool as keyof typeof messages]?.[
        status as keyof typeof messages.document_retrieval
      ] || "Processing..."
    );
  };

  if (!toolStatus.length) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
        marginVertical: 4,
      }}
    >
      <View
        style={{
          maxWidth: "80%",
          backgroundColor: "#eff6ff",
          borderWidth: 1,
          borderColor: "#bfdbfe",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
        }}
      >
        {toolStatus.map((tool, index) => {
          const IconComponent = getToolIcon(tool.tool);
          const isRunning = tool.status === "running";
          const isComplete = tool.status === "complete";

          return (
            <View
              key={`${tool.tool}-${index}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 2,
              }}
            >
              {isComplete ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <IconComponent
                  size={16}
                  color={isRunning ? "#3b82f6" : "#6b7280"}
                />
              )}
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: isComplete
                    ? "#065f46"
                    : isRunning
                    ? "#1e40af"
                    : "#374151",
                }}
              >
                {getToolMessage(tool.tool, tool.status)}
              </Text>
              {isComplete && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    backgroundColor: "#10b981",
                    borderRadius: 2,
                    marginLeft: 4,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};
