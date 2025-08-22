import { ImageUpload } from "@/components/image-upload";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { User, UserType } from "@/types";
import { CheckIcon, Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useDebounceValue } from "usehooks-ts";
import {
  useCreateGroupChatMutation,
  useGetSuggestedUsersQuery,
  useLazySearchUsersQuery,
} from "./api";
import { useRouter } from "expo-router";
import { useToastUtility } from "@/hooks/useToastUtility";
import { useAppSelector } from "@/store/hooks";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";

const NewGroup = () => {
  const router = useRouter();
  const toast = useToastUtility();

  const { userType } = useAppSelector((state) => state.auth);

  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<any>();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(searchQuery, 300);

  const [searchUsers, { data: users, isLoading }] = useLazySearchUsersQuery();
  const { data: suggestedUsers, isLoading: isLoadingSuggested } =
    useGetSuggestedUsersQuery();
  const [createGroup, { isLoading: isCreatingGroup }] =
    useCreateGroupChatMutation();

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery, searchUsers]);

  // Check if all requirements are met
  const canCreateGroup = groupName.trim() && selectedUsers.length >= 2;

  const handleCreateGroup = async () => {
    if (!canCreateGroup) {
      return;
    }

    try {
      const chat = await createGroup({
        name: groupName.trim(),
        participants: selectedUsers.map((u) => u.id),
        avatar: groupAvatar,
      }).unwrap();

      router.replace({
        pathname:
          userType === UserType.STUDENT
            ? "/(student-tabs)/chats/[id]"
            : "/(advisor-tabs)/home/chats/[id]",
        params: { id: chat.id },
      });
    } catch (error) {
      toast.showErrorToast("Failed to create group");
      console.error("Failed to create group:", error);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const renderUserList = (userList: User[]) => {
    if (!userList || userList.length === 0) {
      return (
        <Text className="px-4 py-8 text-center text-muted-foreground">
          No users found
        </Text>
      );
    }

    return userList.map((user) => {
      return (
        <TouchableOpacity
          key={user.id}
          className={`px-4 py-2 flex-row items-center gap-3`}
          onPress={() => toggleUserSelection(user)}
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

          <Checkbox
            value={
              selectedUsers.some((u) => u.id === user.id) ? "true" : "false"
            }
            isChecked={selectedUsers.some((u) => u.id === user.id)}
            onChange={() => toggleUserSelection(user)}
            className="h-6 w-6"
          >
            <CheckboxIndicator className="rounded-full">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
          </Checkbox>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: canCreateGroup ? 100 : 16, // Add bottom padding when button is visible
        }}
      >
        <View className="gap-4">
          <View className="px-4 gap-4">
            <ImageUpload size="md" onFileSelect={setGroupAvatar} />
            <Input className="flex-1" size="lg">
              <InputField
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Group name"
              />
            </Input>
            <Input className="flex-1 px-4 rounded-xl">
              <InputIcon as={Search} />
              <InputField
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </Input>
          </View>

          {selectedUsers.length > 0 && (
            <View className="px-4 py-2 gap-2">
              <Text className="text-sm text-gray-600 mb-2">
                Selected ({selectedUsers.length})
              </Text>
              <View className="flex-row gap-2" style={{ flexWrap: "wrap" }}>
                {selectedUsers.map((user) => (
                  <View
                    key={user.id}
                    className="flex-row items-center gap-1 bg-primary-100/50 px-2 py-1 rounded-full"
                  >
                    <Text className="text-xs text-primary-600">
                      {user.firstName} {user.lastName}
                    </Text>
                    <TouchableOpacity onPress={() => toggleUserSelection(user)}>
                      <Icon as={X} size="sm" className="text-gray-500" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="flex-1">
            <View className="gap-2">
              {searchQuery ? (
                <>
                  {isLoading && (
                    <View className="flex-1 items-center justify-center py-4">
                      <ActivityIndicator size="small" color={"#218bff"} />
                      <Text className="text-sm text-muted-foreground mt-2">
                        Searching users...
                      </Text>
                    </View>
                  )}
                  {!isLoading && users && renderUserList(users)}
                </>
              ) : (
                <>
                  <Text className="px-4 text-gray-600 font-medium text-base">
                    Suggested
                  </Text>
                  {isLoadingSuggested && (
                    <View className="flex-1 items-center justify-center py-4">
                      <ActivityIndicator size="small" color={"#218bff"} />
                      <Text className="text-sm text-muted-foreground mt-2">
                        Loading suggestions...
                      </Text>
                    </View>
                  )}
                  {!isLoadingSuggested &&
                    suggestedUsers &&
                    renderUserList(
                      suggestedUsers.map(
                        (iUser) => iUser.student || iUser.advisor!
                      )
                    )}
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button that only appears when requirements are met */}
      {canCreateGroup && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Button
            className="rounded-lg"
            onPress={handleCreateGroup}
            isDisabled={isCreatingGroup}
          >
            <ButtonText>
              {isCreatingGroup
                ? "Creating..."
                : `Create Group (${selectedUsers.length} member${
                    selectedUsers.length !== 1 ? "s" : ""
                  })`}
            </ButtonText>
          </Button>
        </View>
      )}
    </View>
  );
};

export default NewGroup;
