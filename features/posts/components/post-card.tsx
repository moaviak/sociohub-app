import React, { useState } from "react";
import { View } from "react-native";
import { Post } from "../types";
import { usePostLikeHandler } from "@/hooks/usePostLikeHandler";
import { PostHeader } from "./post-header";
import { PostMedia } from "./post-media";
import { PostActions } from "./post-actions";
import { PostStats } from "./post-stats";
import { CommentsActionSheet } from "./comments-action-sheet";

interface PostCardProps {
  post: Post;
  onPostDeleted?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { isLiked, likes, handleLike } = usePostLikeHandler(post);
  const [showComments, setShowComments] = useState(false);

  const handleCommentPress = () => {
    setShowComments(true);
  };

  return (
    <>
      <View className="bg-white mb-4">
        <PostHeader post={post} onPostDeleted={onPostDeleted} />
        <PostMedia post={post} />
        <PostActions
          isLiked={isLiked}
          onLike={handleLike}
          likes={likes}
          comments={post.comments.length}
          onCommentPress={handleCommentPress}
        />
        <PostStats post={post} />
      </View>

      <CommentsActionSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        post={post}
      />
    </>
  );
};
