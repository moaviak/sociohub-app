import { Dimensions, View, Image, FlatList } from "react-native";
import { Post } from "../types";
import { useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { HStack } from "@/components/ui/hstack";

const { width: screenWidth } = Dimensions.get("window");

interface PostMediaProps {
  post: Post;
}

// Create a separate component for video items to properly handle the hook
const VideoItem: React.FC<{ item: any; screenWidth: number }> = ({
  item,
  screenWidth,
}) => {
  const player = useVideoPlayer(item.url);

  return (
    <View style={{ width: screenWidth }}>
      <View
        style={{
          width: screenWidth,
          height: screenWidth,
          backgroundColor: "#f3f4f6",
        }}
      >
        <VideoView
          style={{
            width: "100%",
            height: "100%",
          }}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>
    </View>
  );
};

// Separate component for image items
const ImageItem: React.FC<{ item: any; screenWidth: number }> = ({
  item,
  screenWidth,
}) => {
  return (
    <View style={{ width: screenWidth }}>
      <View
        style={{
          width: screenWidth,
          height: screenWidth,
          backgroundColor: "#f3f4f6",
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export const PostMedia: React.FC<PostMediaProps> = ({ post }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!post.media || post.media.length === 0) {
    return null;
  }

  const renderMediaItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === "IMAGE") {
      return <ImageItem item={item} screenWidth={screenWidth} />;
    } else {
      return <VideoItem item={item} screenWidth={screenWidth} />;
    }
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  return (
    <View>
      <FlatList
        data={post.media}
        renderItem={renderMediaItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />

      {post.media.length > 1 && (
        <HStack className="justify-center mt-2" space="xs">
          {post.media.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: index === currentIndex ? "#3b82f6" : "#d1d5db",
              }}
            />
          ))}
        </HStack>
      )}
    </View>
  );
};
