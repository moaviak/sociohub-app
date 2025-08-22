import { ImageUpload } from "@/components/image-upload";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/user-avatar";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "expo-router";
import {
  LogOut,
  Trash2,
  UserPlus,
  MoreVertical,
  User,
  UserMinus,
} from "lucide-react-native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useState } from "react";
import {
  useDeleteGroupChatMutation,
  useDeleteOneToOneChatMutation,
  useLeaveGroupChatMutation,
  useRemoveParticipantMutation,
} from "./api";
import { useToastUtility } from "@/hooks/useToastUtility";
import { UserType } from "@/types";

const ChatDetails = () => {
  const { user: currentUser, userType } = useAppSelector((state) => state.auth);
  const { onlineUsers, activeChat: chat } = useAppSelector(
    (state) => state.chats
  );
  const router = useRouter();
  const toast = useToastUtility();

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [removeParticipant] = useRemoveParticipantMutation();
  const [deleteOneToOneChat, { isLoading: isDeletingChat }] =
    useDeleteOneToOneChatMutation();
  const [leaveGroupChat, { isLoading: isLeaving }] =
    useLeaveGroupChatMutation();
  const [deleteGroupChat, { isLoading: isDeletingGroup }] =
    useDeleteGroupChatMutation();

  const getChatPartner = () => {
    if (chat?.type === "ONE_ON_ONE") {
      const partner = chat.participants.find(
        (p) =>
          p.studentId !== currentUser?.id && p.advisorId !== currentUser?.id
      );
      return { ...partner, ...partner?.student, ...partner?.advisor };
    }
    return null;
  };

  const chatPartner = getChatPartner();
  const isOnline = chatPartner && onlineUsers[chatPartner.id!];
  const isAdmin =
    chat?.type === "GROUP" &&
    (chat.admin?.advisorId === currentUser?.id ||
      chat.admin?.studentId === currentUser?.id);

  if (!chat) {
    return null;
  }

  const handleMemberPress = (participant: any) => {
    const user = participant.student || participant.advisor!;
    setSelectedMember({ participant, user });
    setDropdownVisible(true);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
    setSelectedMember(null);
  };

  const handleViewProfile = () => {
    if (selectedMember) {
      const userId =
        selectedMember.user.advisorId ||
        selectedMember.user.studentId ||
        selectedMember.user.id;
      router.push({
        pathname: "/profile/[id]",
        params: { id: userId },
      });
    }
    closeDropdown();
  };

  const handleRemoveMember = async () => {
    if (selectedMember) {
      try {
        await removeParticipant({
          chatId: chat.id,
          participantId: selectedMember.participant.id,
        }).unwrap();
        toast.showSuccessToast("Member removed successfully!");
      } catch (error) {
        toast.showErrorToast("Failed to remove member.");
        console.error(error);
      }
    }
    closeDropdown();
  };

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
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16 }}
    >
      {chat.type === "ONE_ON_ONE" && chatPartner && (
        <View className="items-center text-center">
          <Avatar
            size="2xl"
            className="bg-gradient-to-br from-primary-500 to-secondary-600"
          >
            <AvatarFallbackText>
              {chatPartner.firstName + " " + chatPartner.lastName}
            </AvatarFallbackText>
            <AvatarImage source={{ uri: chatPartner.avatar }} />
          </Avatar>
          <Text className="text-xl font-body font-bold mt-2">
            {chatPartner.firstName + " " + chatPartner.lastName}
          </Text>
          <View className="flex-row items-center gap-1">
            <View
              style={{
                height: 8,
                width: 8,
                borderRadius: 8,
                backgroundColor: isOnline ? "#22c55e" : "#6b7280",
              }}
            />
            <Text>{isOnline ? "Online" : "Offline"}</Text>
          </View>

          <Button
            variant="outline"
            className="mt-4"
            onPress={() =>
              router.push({
                pathname: "/profile/[id]",
                params: { id: chatPartner.advisorId || chatPartner.studentId! },
              })
            }
          >
            <ButtonText>View Profile</ButtonText>
          </Button>

          <TouchableOpacity
            className="flex-row items-center px-4 py-2 gap-4 w-full mt-4"
            onPress={() => handleDeleteOneToOneChat()}
          >
            <View
              className="items-center justify-center bg-error-100/50 rounded-full"
              style={{ height: 40, width: 40 }}
            >
              <Icon as={Trash2} className="text-error-500" size="xl" />
            </View>
            <Text className="text-lg font-medium">Delete Chat</Text>
          </TouchableOpacity>
        </View>
      )}

      {chat.type === "GROUP" && (
        <View className="py-4 gap-4">
          <View className="items-center text-center px-4">
            {isAdmin ? (
              <ImageUpload
                size="md"
                initialImage={chat.chatImage}
                uploadText="Change Image"
              />
            ) : (
              <Avatar
                size="xl"
                className="bg-gradient-to-br from-primary-500 to-secondary-600"
              >
                <AvatarFallbackText>{chat.name}</AvatarFallbackText>
              </Avatar>
            )}
            <Text className="text-xl font-bold mt-2 text-center">
              {chat.name}
            </Text>
          </View>
          <View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname:
                    userType === UserType.STUDENT
                      ? "/(student-tabs)/chats/[id]/add-members"
                      : "/(advisor-tabs)/home/chats/[id]/add-members",
                  params: { id: chat.id },
                })
              }
              className="flex-row items-center px-4 py-2 gap-4"
            >
              <View
                className="items-center justify-center bg-primary-100/50 rounded-full"
                style={{ height: 40, width: 40 }}
              >
                <Icon as={UserPlus} className="text-primary-500" size="xl" />
              </View>
              <Text className="text-lg font-medium">Add Members</Text>
            </TouchableOpacity>
            {chat.type === "GROUP" && !isAdmin && (
              <TouchableOpacity
                className="flex-row items-center px-4 py-2 gap-4"
                onPress={() => handleLeaveGroupChat()}
              >
                <View
                  className="items-center justify-center bg-error-100/50 rounded-full"
                  style={{ height: 40, width: 40 }}
                >
                  <Icon as={LogOut} className="text-error-500" size="xl" />
                </View>
                <Text className="text-lg font-medium">Exit Group</Text>
              </TouchableOpacity>
            )}
            {chat.type === "GROUP" && isAdmin && (
              <TouchableOpacity
                className="flex-row items-center px-4 py-2 gap-4"
                onPress={() => handleDeleteGroupChat()}
              >
                <View
                  className="items-center justify-center bg-error-100/50 rounded-full"
                  style={{ height: 40, width: 40 }}
                >
                  <Icon as={Trash2} className="text-error-500" size="xl" />
                </View>
                <Text className="text-lg font-medium">Delete Group</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-base font-medium">
              Members ({chat.participants.length})
            </Text>
            <View className="gap-2">
              {chat.participants.map((p, index) => {
                const user = p.student || p.advisor!;
                const isParticipantAdmin = p.id === chat.adminId;
                const isCurrentUser = user?.id === currentUser?.id;

                return (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center gap-2 py-2"
                    onPress={() => handleMemberPress(p)}
                    disabled={isCurrentUser} // Disable press for current user
                  >
                    <Avatar className="bg-gradient-to-br from-primary-500 to-secondary-600">
                      <AvatarFallbackText className="text-white">{`${user.firstName} ${user.lastName}`}</AvatarFallbackText>
                      <AvatarImage
                        source={{
                          uri: user.avatar,
                        }}
                      />
                    </Avatar>
                    <View className="flex-1">
                      <Text
                        className={`font-medium font-body text-base`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >{`${user.firstName} ${user.lastName}`}</Text>
                    </View>
                    {isCurrentUser && <Text className="text-sm ">(You)</Text>}
                    {isParticipantAdmin && (
                      <Badge className="bg-primary-100/50 rounded-lg">
                        <BadgeText className="text-primary-600">
                          Admin
                        </BadgeText>
                      </Badge>
                    )}
                    {!isCurrentUser && (
                      <Icon
                        as={MoreVertical}
                        className="text-gray-400"
                        size="sm"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={closeDropdown}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                minWidth: 200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              {selectedMember && (
                <>
                  {/* Header */}
                  <View
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f3f4f6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {selectedMember.user.firstName}{" "}
                      {selectedMember.user.lastName}
                    </Text>
                  </View>

                  {/* Menu Options */}
                  <View>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        gap: 12,
                      }}
                      onPress={handleViewProfile}
                    >
                      <Icon as={User} className="text-blue-500" size="lg" />
                      <Text style={{ fontSize: 16 }}>View Profile</Text>
                    </TouchableOpacity>

                    {isAdmin && selectedMember.user.id !== currentUser?.id && (
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 16,
                          gap: 12,
                          borderTopWidth: 1,
                          borderTopColor: "#f3f4f6",
                        }}
                        onPress={handleRemoveMember}
                      >
                        <Icon
                          as={UserMinus}
                          className="text-error-500"
                          size="lg"
                        />
                        <Text style={{ fontSize: 16, color: "#ef4444" }}>
                          Remove Member
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default ChatDetails;
