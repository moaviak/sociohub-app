import { useState } from "react";
import { Post } from "../types";
import { VStack } from "@/components/ui/vstack";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { Ticket } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

interface PostStatsProps {
  post: Post;
}

export const PostStats: React.FC<PostStatsProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const shouldShowSeeMore = post.content && post.content.length > 100;

  return (
    <VStack className="px-4 pb-3" space="xs">
      {/* Caption */}
      {post.content && (
        <View>
          {post.event && (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/event/[id]",
                  params: { id: post.eventId! },
                });
              }}
              activeOpacity={0.7}
            >
              <HStack className="items-center mb-1" space="xs">
                <Icon as={Ticket} size="sm" className="text-primary-500" />
                <Text className="text-primary-500 font-semibold text-xs">
                  {post.event.title}
                </Text>
              </HStack>
            </TouchableOpacity>
          )}

          <Text className="text-sm text-gray-900">
            <Text className="font-semibold">{post.society.name} </Text>
            {expanded || !shouldShowSeeMore
              ? post.content
              : `${post.content.substring(0, 100)}...`}
          </Text>

          {shouldShowSeeMore && (
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              activeOpacity={0.7}
            >
              <Text className="text-gray-500 text-sm mt-1">
                {expanded ? "See less" : "See more"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </VStack>
  );
};
