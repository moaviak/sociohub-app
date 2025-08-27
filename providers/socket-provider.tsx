import {
  setAgentThought,
  setToolStatus,
  ToolStatus,
} from "@/features/chatbot/slice";
import {
  addMessageWithRefresh,
  deleteMessage,
  handleChatDeletionOrLeave,
  removeChatParticipant,
  setOnlineUsers,
  setUserOffline,
  setUserOnline,
  startTyping,
  stopTyping,
} from "@/features/chats/slice";
import { Message } from "@/features/chats/types";
import {
  addNotification,
  setUnreadCount,
} from "@/features/notifications/slice";
import { useToastUtility } from "@/hooks/useToastUtility";
import { disconnectSocket, getSocket, initializeSocket } from "@/lib/socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Notification, UserType } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const previousTokenRef = useRef<string | null>(null);
  const authErrorRef = useRef(false);

  const { showNotificationToast } = useToastUtility();
  const router = useRouter();

  // Get authentication token from Redux
  const { accessToken: token, userType } = useAppSelector(
    (state) => state.auth
  );

  const { activeChat } = useAppSelector((state) => state.chats);

  const initializeSocketConnection = useCallback(() => {
    if (!token) {
      if (socketInitialized) {
        disconnectSocket();
        setSocketInitialized(false);
      }
      return;
    }

    // Reset auth error if token has changed
    if (previousTokenRef.current !== token) {
      authErrorRef.current = false;
      previousTokenRef.current = token;
    }

    // Don't try to connect if we had an auth error
    if (authErrorRef.current) {
      return;
    }

    try {
      // Initialize socket connection with just the token
      const socket = initializeSocket(token);
      setSocketInitialized(true);
      setConnectionError(null);
      setRetryCount(0); // Reset retry count on successful connection

      // Listen for notification count updates
      socket.on("notification-count", (data: { count: number }) => {
        dispatch(setUnreadCount(data.count));
      });

      // Listen for new notifications
      socket.on("new-notification", (notification: Notification) => {
        dispatch(addNotification(notification));
        showNotificationToast(notification);
      });

      // Listen for message events
      socket.on("new-message", (message: Message) => {
        dispatch(addMessageWithRefresh(message));
      });

      socket.on("delete-message", ({ messageId, chatId }) => {
        dispatch(deleteMessage({ messageId, chatId }));
      });

      socket.on("chat-deleted", ({ chatId }) => {
        if (activeChat?.id === chatId) {
          userType === UserType.STUDENT
            ? router.replace("/(student-tabs)/chats")
            : router.replace("/(advisor-tabs)/home/chats");
        }
        dispatch(handleChatDeletionOrLeave());
      });

      socket.on("group-deleted", ({ chatId }) => {
        if (activeChat?.id === chatId) {
          userType === UserType.STUDENT
            ? router.replace("/(student-tabs)/chats")
            : router.replace("/(advisor-tabs)/home/chats");
        }
        dispatch(handleChatDeletionOrLeave());
      });

      socket.on("group-left", ({ chatId, userId }) => {
        dispatch(removeChatParticipant({ chatId, userId }));
      });

      socket.on("chat-partners-status", (statuses) => {
        dispatch(setOnlineUsers(statuses));
      });

      socket.on("user-online", ({ userId }) => {
        dispatch(setUserOnline(userId));
      });

      socket.on("user-offline", ({ userId }) => {
        dispatch(setUserOffline(userId));
      });

      socket.on("typing", ({ chatId, userId }) => {
        dispatch(startTyping({ chatId, userId }));
      });

      socket.on("stop-typing", ({ chatId, userId }) => {
        dispatch(stopTyping({ chatId, userId }));
      });

      // Chat-Bot Events
      socket.on("tool_status", (toolStatus: ToolStatus) => {
        dispatch(setToolStatus(toolStatus));
      });

      socket.on("agent_thought", ({ thought }) => {
        dispatch(setAgentThought(thought));
      });

      // Listen for connection errors
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        if (error.message.includes("Authentication error")) {
          // TODO: Try refetching the tokens
          setConnectionError("Authentication failed. Please log in again.");
          authErrorRef.current = true;
          disconnectSocket();
          setSocketInitialized(false);
        }
      });

      // Listen for successful connection
      socket.on("connect", () => {
        console.log("Socket connected successfully");
        authErrorRef.current = false;
        // Request notification count on connect
        socket.emit("get-notification-count");
        socket.emit("get-chat-partners-status");
      });

      return () => {
        // Clean up socket listeners
        if (socket) {
          socket.off("notification-count");
          socket.off("new-notification");
          socket.off("new-message");
          socket.off("connect_error");
          socket.off("connect");
          socket.off("chat-partners-status");
          socket.off("user-online");
          socket.off("user-offline");
          socket.off("typing");
          socket.off("stop-typing");
          socket.off("tool_status");
          socket.off("agent_thought");
        }
      };
    } catch (error) {
      console.error("Error initializing socket:", error);
      setConnectionError("Failed to connect to notification service");
    }
  }, [token, socketInitialized]);

  // Effect for initial connection and token changes
  useEffect(() => {
    const cleanup = initializeSocketConnection();
    return cleanup;
  }, [initializeSocketConnection]);

  // Effect for retry mechanism
  useEffect(() => {
    if (
      !socketInitialized &&
      token &&
      retryCount < 3 &&
      !authErrorRef.current
    ) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        initializeSocketConnection();
      }, 1000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [socketInitialized, token, retryCount, initializeSocketConnection]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (socketInitialized) {
        disconnectSocket();
      }
    };
  }, [socketInitialized]);

  return children;
};

// Helper function to mark a notification as read
export const markNotificationRead = (notificationId: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("mark-notification-read", { notificationId });
  }
};

export default SocketProvider;
