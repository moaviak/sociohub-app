import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../_layout";
import { useLocalSearchParams } from "expo-router";
import { useGetPostByIdQuery } from "@/features/posts/api";
import PostForm from "@/features/posts/post-form";

const EditPost = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading } = useGetPostByIdQuery(id);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="Edit Post" backButton />
      {/* Main Content */}
      <View className="flex-1 p-4 bg-white">
        <PostForm societyId={post.societyId} post={post} />
      </View>
    </SafeAreaView>
  );
};
export default EditPost;
