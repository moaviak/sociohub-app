import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { multiFormatDateString } from "@/lib/utils";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { Post } from "../types";
import { useState } from "react";
import { useAddCommentMutation, useGetCommentsQuery } from "../api";
import { useAppSelector } from "@/store/hooks";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Send } from "lucide-react-native";

interface CommentItemProps {
  comment: any;
}

interface CommentsActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export const CommentsActionSheet: React.FC<CommentsActionSheetProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [comment, setComment] = useState("");
  const { data: comments, isLoading: isFetchingComments } = useGetCommentsQuery(
    { postId: post.id },
    { skip: !isOpen }
  );
  const [addComment, { isLoading }] = useAddCommentMutation();
  const currentUser = useAppSelector((state) => state.auth.user);

  const handleAddComment = async () => {
    if (comment.trim()) {
      try {
        await addComment({ postId: post.id, content: comment }).unwrap();
        setComment("");
      } catch (error) {
        // Handle error
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Enter") {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleSubmitEditing = () => {
    handleAddComment();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent style={{ maxHeight: "90%" }}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="justify-between">
            <ScrollView style={{ flex: 1 }}>
              {isFetchingComments && (
                <View className="flex-1 justify-center items-center bg-gray-50">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-500 mt-4">
                    Loading comments...
                  </Text>
                </View>
              )}
              <VStack className="flex-1 mt-4" space="md">
                {comments?.map((comment) => {
                  const author =
                    comment.author.student || comment.author.advisor!;
                  return (
                    <View key={comment.id} className="flex-row gap-3 py-2">
                      <Avatar
                        className="bg-gradient-to-br from-primary-500 to-secondary-600"
                        style={{ width: 32, height: 32 }}
                      >
                        <AvatarFallbackText className="text-white">
                          {author?.firstName} {author?.lastName}
                        </AvatarFallbackText>
                        <AvatarImage source={{ uri: author?.avatar }} />
                      </Avatar>
                      <View className="gap-1">
                        <View className="flex-row items-center gap-2">
                          <Text
                            className="font-medium text-xs"
                            numberOfLines={1}
                          >
                            {author.firstName} {author.lastName}
                          </Text>
                          <Text className="text-xs text-gray-600">
                            {multiFormatDateString(comment.createdAt, true)}
                          </Text>
                        </View>
                        <Text
                          className="text-gray-600"
                          style={{ paddingRight: 12 }}
                        >
                          {comment.content}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </VStack>
            </ScrollView>
            <View className="flex-row gap-2 w-full items-center border-t border-gray-200 py-2">
              <Avatar
                className="bg-gradient-to-br from-primary-500 to-secondary-600"
                style={{ width: 32, height: 32 }}
              >
                <AvatarFallbackText>
                  {currentUser?.firstName} {currentUser?.lastName}
                </AvatarFallbackText>
                <AvatarImage source={{ uri: currentUser?.avatar }} />
              </Avatar>
              <Input className="flex-1 border-0">
                <InputField
                  placeholder="Add a comment"
                  returnKeyType="send"
                  value={comment}
                  onChangeText={setComment}
                  submitBehavior="blurAndSubmit"
                  onKeyPress={handleKeyPress}
                  onSubmitEditing={handleSubmitEditing}
                  editable={!isLoading}
                />
                {comment.trim() && (
                  <TouchableOpacity
                    onPress={handleAddComment}
                    disabled={isLoading}
                  >
                    <InputIcon
                      as={Send}
                      className={`${
                        isLoading ? "text-gray-400" : "text-primary-500"
                      }`}
                      size="xl"
                    />
                  </TouchableOpacity>
                )}
              </Input>
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </KeyboardAvoidingView>
  );
};
