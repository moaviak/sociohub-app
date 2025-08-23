import PostForm from "@/features/posts/post-form";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { View, Text } from "react-native";

const CreatePostScreen = () => {
  const societyId = useGetSocietyId();

  return (
    <View className="flex-1 bg-white">
      <PostForm societyId={societyId} />
    </View>
  );
};

export default CreatePostScreen;
