import React from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useGetSocietyPostsQuery } from "./api";
import { PostCard } from "./components/post-card";
import { VStack } from "@/components/ui/vstack";
const SocietyPosts: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { data: posts, isLoading } = useGetSocietyPostsQuery(societyId);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Loading posts...</Text>
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 mt-4">No posts</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <VStack space="lg" className="flex-1">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </VStack>
    </ScrollView>
  );
};
export default SocietyPosts;
