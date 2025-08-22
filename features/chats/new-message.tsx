import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { User, UserType } from "@/types";
import { CheckIcon, UsersRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDebounceValue } from "usehooks-ts";
import {
  useCreateOneToOneChatMutation,
  useGetSuggestedUsersQuery,
  useLazySearchUsersQuery,
} from "./api";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";

const NewMessage = () => {
  const router = useRouter();

  const { userType } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(searchQuery, 300);
  const [creatingChatForUserId, setCreatingChatForUserId] = useState<
    string | null
  >(null);

  const [searchUsers, { data: users, isFetching: isLoading }] =
    useLazySearchUsersQuery();
  const { data: suggestedUsers, isLoading: isLoadingSuggested } =
    useGetSuggestedUsersQuery();
  const [createChat, { isLoading: isCreatingChat }] =
    useCreateOneToOneChatMutation();

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery, searchUsers]);

  const handleStartOneOnOneChat = async (user: User) => {
    try {
      setCreatingChatForUserId(user.id);
      const chat = await createChat(user.id).unwrap();
      router.replace({
        pathname:
          userType === UserType.STUDENT
            ? "/(student-tabs)/chats/[id]"
            : "/(advisor-tabs)/home/chats/[id]",
        params: { id: chat.id },
      });
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setCreatingChatForUserId(null);
    }
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
      const isCreatingChatForThisUser = creatingChatForUserId === user.id;
      const isDisabled = isCreatingChat && creatingChatForUserId !== null;

      return (
        <TouchableOpacity
          key={user.id}
          className={`px-4 py-2 flex-row items-center gap-3 ${
            isDisabled ? "opacity-50" : ""
          }`}
          onPress={() => handleStartOneOnOneChat(user)}
          disabled={isDisabled}
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

          {isCreatingChatForThisUser && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={"#218bff"} />
              <Text className="text-sm text-primary-500">Creating chat...</Text>
            </View>
          )}

          {/* <Checkbox
            value={selectedUser?.id === user.id ? "true" : "false"}
            isChecked={selectedUser?.id === user.id}
            onChange={() => setSelectedUser(user)}
            className="h-5 w-5"
          >
            <CheckboxIndicator className="rounded-full">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
          </Checkbox> */}
        </TouchableOpacity>
      );
    });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 16 }}
    >
      <View>
        <View className="flex-row items-center gap-4 px-4 w-full">
          <Text className="">To:</Text>
          <Input className="flex-1 border-0">
            <InputField
              placeholder="Search..."
              className="text-lg"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Input>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push(
              userType === UserType.STUDENT
                ? "/(student-tabs)/chats/new-group"
                : "/(advisor-tabs)/home/chats/new-group"
            )
          }
          className="flex-row items-center px-4 py-2 gap-4 w-full mt-4"
        >
          <View
            className="items-center justify-center bg-primary-100/50 rounded-full"
            style={{ height: 40, width: 40 }}
          >
            <Icon as={UsersRound} className="text-primary-500" size="xl" />
          </View>
          <Text className="text-lg font-medium">New Group</Text>
        </TouchableOpacity>

        <View className="gap-2 mt-4">
          {isLoading && (
            <View className="flex-1 items-center justify-center py-4">
              <ActivityIndicator size="small" color={"#218bff"} />
              <Text className="text-sm text-muted-foreground mt-2">
                Searching users...
              </Text>
            </View>
          )}
          {!isLoading && searchQuery && users && renderUserList(users)}
          {!isLoading && !searchQuery && suggestedUsers && (
            <>
              <Text className="px-4 text-muted-foreground font-medium">
                Suggested
              </Text>
              <View>
                {renderUserList(
                  suggestedUsers.map((iUser) => iUser.student || iUser.advisor!)
                )}
              </View>
            </>
          )}
        </View>

        {/* Global loading overlay when creating any chat */}
        {isCreatingChat && creatingChatForUserId && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <View className="bg-white rounded-lg p-4 shadow-lg items-center">
              <ActivityIndicator size="large" color={"#218bff"} />
              <Text className="text-base font-medium mt-2">
                Starting conversation...
              </Text>
              <Text className="text-sm text-muted-foreground">Please wait</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default NewMessage;
