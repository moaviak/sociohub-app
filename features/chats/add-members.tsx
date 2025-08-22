import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Chat } from "./types";
import { User } from "@/types";
import { useDebounceValue } from "usehooks-ts";
import {
  useAddParticipantsMutation,
  useGetSuggestedUsersQuery,
  useLazySearchUsersQuery,
} from "./api";
import { useToastUtility } from "@/hooks/useToastUtility";
import { useRouter } from "expo-router";
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
import { CheckIcon, Search, X } from "lucide-react-native";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";

const AddMembers: React.FC<{ chat: Chat }> = ({ chat }) => {
  const toast = useToastUtility();
  const router = useRouter();

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(searchQuery, 300);

  const [searchUsers, { data: users, isLoading }] = useLazySearchUsersQuery({
    selectFromResult: ({ data, ...params }) => {
      const participants = chat.participants.map(
        (participant) => participant.studentId || participant.advisorId
      );
      const result = data?.filter((user) => !participants.includes(user.id));
      return { data: result || [], ...params };
    },
  });
  const { data: suggestedUsers, isLoading: isLoadingSuggested } =
    useGetSuggestedUsersQuery();
  const [addParticipants, { isLoading: isAdding }] =
    useAddParticipantsMutation();

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery, searchUsers]);

  const handleAddMembers = async () => {
    try {
      await addParticipants({
        chatId: chat.id,
        participantIds: selectedUsers.map((u) => u.id),
      }).unwrap();
      toast.showSuccessToast("Members added successfully");
      router.back();
    } catch (error) {
      toast.showErrorToast("Failed to add members");
      console.error("Failed to add members:", error);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const existingParticipantIds = chat.participants.map(
    (p) => p.studentId || p.advisorId!
  );

  const renderUserList = (userList: User[]) => {
    const filteredList = userList.filter(
      (u) => !existingParticipantIds.includes(u.id)
    );

    if (!filteredList || filteredList.length === 0) {
      return (
        <Text className="px-4 py-8 text-center text-muted-foreground">
          No users found
        </Text>
      );
    }

    return filteredList.map((user) => {
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
          paddingBottom: selectedUsers.length > 0 ? 100 : 16,
        }}
      >
        <View className="gap-4">
          <Input
            className="flex-1 px-4 rounded-xl"
            style={{ marginHorizontal: 16 }}
          >
            <InputIcon as={Search} />
            <InputField
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Input>

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

      {selectedUsers.length > 0 && (
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
            onPress={handleAddMembers}
            isDisabled={isAdding || selectedUsers.length === 0}
          >
            <ButtonText>
              {isAdding
                ? "Adding..."
                : `Add (${selectedUsers.length} member${
                    selectedUsers.length !== 1 ? "s" : ""
                  })`}
            </ButtonText>
          </Button>
        </View>
      )}
    </View>
  );
};

export default AddMembers;
