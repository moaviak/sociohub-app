import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Heart, MessageCircle } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";

interface PostActionsProps {
  isLiked: boolean;
  onLike: () => void;
  likes: number;
  comments: number;
  onCommentPress: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  onLike,
  likes,
  comments,
  onCommentPress,
}) => {
  return (
    <HStack className="items-center px-4 py-2" space="md">
      <TouchableOpacity
        onPress={onLike}
        activeOpacity={0.7}
        className="flex-row items-center gap-1"
      >
        <Icon
          as={Heart}
          size="xl"
          className={
            isLiked ? "text-error-500 fill-error-500" : "text-gray-900"
          }
        />
        <Text>{likes.toLocaleString()}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCommentPress}
        activeOpacity={0.7}
        className="flex-row items-center gap-1"
      >
        <Icon as={MessageCircle} size="xl" className="text-gray-900" />
        <Text>{comments.toLocaleString()}</Text>
      </TouchableOpacity>
    </HStack>
  );
};
