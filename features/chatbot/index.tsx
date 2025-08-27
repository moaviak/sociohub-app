import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useCreateSessionMutation, useSendQueryMutation } from "./api";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { RefreshCw } from "lucide-react-native";
import { ChatMessage } from "./types";
import {
  addMessage,
  clearAgentThought,
  clearToolStatus,
  setSessionId,
} from "./slice";
import ApiError from "@/store/api-error";
import { Message } from "./components/message";
import { AgentThoughtIndicator } from "./components/agent-thought-indicator";
import { ToolStatusIndicator } from "./components/tool-status-indicator";
import { TypingIndicator } from "@/components/typing-indicator";
import { MessageInput } from "./components/message-input";

const ChatBot = () => {
  const { messages, sessionId, isLoading, toolStatus, agentThought } =
    useAppSelector((state) => state.chatBot);
  const dispatch = useAppDispatch();

  const [sendQuery, { isLoading: isBotReplying }] = useSendQueryMutation();
  const [createSession, { isLoading: isSessionRefreshing }] =
    useCreateSessionMutation();

  const scrollViewRef = useRef<ScrollView>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isBotReplying, agentThought, toolStatus]);

  const handleSessionRefresh = async () => {
    try {
      setSessionError(null);
      await createSession().unwrap();
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setSessionError("Failed to create a new chat session. Please try again.");
    }
  };

  if (!sessionId && !isLoading) {
    handleSessionRefresh();
    return (
      <AlertDialog defaultIsOpen size="md">
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className="text-typography-950 font-semibold" size="md">
              Chat Session Initializing
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
            <Text size="sm">
              {sessionError || "Initializing chat session. Please wait..."}
            </Text>
          </AlertDialogBody>
          {sessionError && (
            <AlertDialogFooter className="">
              <Button
                isDisabled={isSessionRefreshing}
                onPress={handleSessionRefresh}
                className="gap-2 rounded"
              >
                <ButtonIcon as={RefreshCw} />
                <ButtonText>Retry</ButtonText>
              </Button>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleSendMessage = async (messageText: string) => {
    if (!sessionId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    dispatch(addMessage(newMessage));

    try {
      const response = await sendQuery({
        sessionId,
        query: messageText,
      }).unwrap();
      dispatch(addMessage(response));
      setSessionError(null);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to send message:", error);

      if (
        (apiError.errorMessage && apiError.errorMessage.includes("Session")) ||
        apiError.errorMessage.includes("session")
      ) {
        dispatch(setSessionId(null));
        setSessionError("Chat session expired. Creating a new session...");
        handleSessionRefresh();
      } else {
        dispatch(
          addMessage({
            id: Date.now().toString(),
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
            timestamp: new Date().toISOString(),
          })
        );
      }
    } finally {
      dispatch(clearToolStatus());
      dispatch(clearAgentThought());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {/* Agent Thought Process Display */}
        {agentThought && <AgentThoughtIndicator agentThought={agentThought} />}

        {/* Tool Status Display */}
        {toolStatus && toolStatus.length > 0 && (
          <ToolStatusIndicator toolStatus={toolStatus} />
        )}

        {/* Bot Reply Indicator */}
        {isBotReplying && (
          <View
            className="px-4 py-2 rounded-lg bg-neutral-200"
            style={{ marginVertical: 4, alignSelf: "flex-start" }}
          >
            <TypingIndicator />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isBotReplying}
      />
    </View>
  );
};

export default ChatBot;
