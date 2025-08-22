import { View, Text } from "react-native";
import { Chat } from "../types";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { LogOut, Trash2 } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { useAppSelector } from "@/store/hooks";
import {
  useDeleteGroupChatMutation,
  useDeleteOneToOneChatMutation,
  useLeaveGroupChatMutation,
} from "../api";
import { useToastUtility } from "@/hooks/useToastUtility";

export const ChatOptions: React.FC<{
  chat: Chat;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ chat, open, setOpen }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const toast = useToastUtility();

  const [deleteOneToOneChat, { isLoading: isDeletingChat }] =
    useDeleteOneToOneChatMutation();
  const [leaveGroupChat, { isLoading: isLeaving }] =
    useLeaveGroupChatMutation();
  const [deleteGroupChat, { isLoading: isDeletingGroup }] =
    useDeleteGroupChatMutation();

  const isAdmin =
    chat.type === "GROUP" &&
    (chat.admin?.advisorId === currentUser?.id ||
      chat.admin?.studentId === currentUser?.id);

  const handleDeleteOneToOneChat = async () => {
    try {
      await deleteOneToOneChat(chat.id).unwrap();
      toast.showSuccessToast("Chat deleted successfully!");
    } catch (error) {
      toast.showErrorToast("Failed to delete chat.");
      console.error(error);
    }
  };

  const handleLeaveGroupChat = async () => {
    try {
      await leaveGroupChat(chat.id).unwrap();
      toast.showSuccessToast("Group left successfully!");
    } catch (error) {
      toast.showErrorToast("Failed to leave group.");
      console.error(error);
    }
  };

  const handleDeleteGroupChat = async () => {
    try {
      await deleteGroupChat(chat.id).unwrap();
      toast.showSuccessToast("Group deleted successfully!");
    } catch (error) {
      toast.showErrorToast("Failed to delete group.");
      console.error(error);
    }
  };

  return (
    <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="pb-6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        {chat.type === "ONE_ON_ONE" && (
          <ActionsheetItem
            onPress={handleDeleteOneToOneChat}
            isDisabled={isDeletingChat}
          >
            <Icon as={Trash2} className="text-error-500" />
            <ActionsheetItemText className="text-error-500">
              Delete Chat
            </ActionsheetItemText>
          </ActionsheetItem>
        )}
        {chat.type === "GROUP" && !isAdmin && (
          <ActionsheetItem
            onPress={handleLeaveGroupChat}
            isDisabled={isLeaving}
          >
            <Icon as={LogOut} className="text-error-500" />
            <ActionsheetItemText className="text-error-500">
              Leave Group
            </ActionsheetItemText>
          </ActionsheetItem>
        )}
        {chat.type === "GROUP" && isAdmin && (
          <ActionsheetItem
            onPress={handleDeleteGroupChat}
            isDisabled={isDeletingGroup}
          >
            <Icon as={Trash2} className="text-error-500" />
            <ActionsheetItemText className="text-error-500">
              Delete Group
            </ActionsheetItemText>
          </ActionsheetItem>
        )}
      </ActionsheetContent>
    </Actionsheet>
  );
};
