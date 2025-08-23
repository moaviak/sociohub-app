import { useAppSelector } from "@/store/hooks";
import { useDeletePostMutation } from "../api";
import { useToastUtility } from "@/hooks/useToastUtility";
import { useRouter } from "expo-router";
import { checkPrivilege, multiFormatDateString } from "@/lib/utils";
import { PRIVILEGES } from "@/constants";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Building, Edit, MoreVertical, Trash2 } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Text, TouchableOpacity } from "react-native";
import { Advisor } from "@/types";
import { Post } from "../types";
import React, { useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";
import ApiError from "@/store/api-error";

interface PostHeaderProps {
  post: Post;
  onPostDeleted?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  onPostDeleted,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);

  const isStudent = currentUser && "registrationNumber" in currentUser;
  const havePrivilege = isStudent
    ? checkPrivilege(
        currentUser!.societies || [],
        post.societyId,
        PRIVILEGES.CONTENT_MANAGEMENT
      )
    : post.societyId === (currentUser as Advisor).societyId;

  return (
    <HStack className="items-center justify-between px-4 py-3">
      <HStack className="items-center" space="sm">
        <Avatar style={{ width: 40, height: 40 }}>
          <Icon as={Building} className="text-white" />
          <AvatarImage
            source={{
              uri: post.society.logo || undefined,
            }}
          />
        </Avatar>

        <VStack>
          <Text className="font-semibold text-sm text-gray-900">
            {post.society.name}
          </Text>
          <Text className="text-xs text-gray-500">
            {multiFormatDateString(post.createdAt)}
          </Text>
        </VStack>
      </HStack>

      {havePrivilege && <PostOptions post={post} />}
    </HStack>
  );
};

const PostOptions: React.FC<{ post: Post }> = ({ post }) => {
  const [open, setOpen] = useState(false);
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const toast = useToastUtility();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post.id, societyId: post.societyId }).unwrap();
      setOpen(false);
      toast.showSuccessToast("Post deleted successfully.");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to delete post.";
      console.error("Failed to delete post.", error);
      toast.showErrorToast(message);
    }
  };

  const handleEdit = () => {
    setOpen(false);
    router.push({
      pathname: "/edit-post/[id]",
      params: { id: post.id },
    });
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setOpen(true)}>
        <Icon as={MoreVertical} className="text-gray-600" />
      </TouchableOpacity>
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={handleEdit}>
            <Icon as={Edit} />
            <ActionsheetItemText>Edit Post</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={handleDelete} isDisabled={isDeleting}>
            <Icon as={Trash2} className="text-error-500" />
            <ActionsheetItemText className="text-error-500">
              Delete Post
            </ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};
