import { ActivityIndicator, Image, Text, View, FlatList } from "react-native";
import { useGetRecentPostsInfiniteQuery } from "./api";
import { useCallback } from "react";
import { PostCard } from "./components/post-card";
import { Post } from "./types";

interface PostsProps {
  headerComponents?: React.ReactNode;
}

const Posts = ({ headerComponents }: PostsProps) => {
  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetRecentPostsInfiniteQuery({ limit: 10 });

  // Fix the data flattening
  const posts = data?.pages?.flatMap((page) => page.posts) ?? [];

  // Handle end reached for infinite scroll
  const handleEndReached = useCallback(() => {
    console.log("End reached:", {
      hasNextPage,
      isFetchingNextPage,
      isFetching,
      postsLength: posts.length,
    });

    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      console.log("Fetching next page...");
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  // Render individual post item
  const renderPost = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <PostCard post={item} />
    ),
    []
  );

  // Render loading footer for posts
  const renderPostsFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-gray-500 mt-2 text-sm">
          Loading more posts...
        </Text>
      </View>
    );
  }, [isFetchingNextPage]);

  // Posts header component
  const renderPostsHeader = useCallback(
    () => (
      <View className="flex-row gap-3 px-4 items-center">
        <Image
          source={require("@/assets/icons/blog.png")}
          style={{ width: 28, height: 28, objectFit: "contain" }}
        />
        <Text className="font-semibold text-xl">Posts Feed</Text>
      </View>
    ),
    []
  );

  // Complete header with external components and posts header
  const renderCompleteHeader = useCallback(
    () => (
      <View>
        {/* External header components (UpcomingEvents, RecentAnnouncements) */}
        {headerComponents}

        {/* Posts section header */}
        {renderPostsHeader()}

        {/* Show loading state for posts */}
        {isLoading && (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-500 mt-2">Loading posts...</Text>
          </View>
        )}
      </View>
    ),
    [headerComponents, isLoading]
  );

  // Render empty posts state
  const renderEmpty = useCallback(() => {
    // Only show empty state if not loading and no posts
    if (isLoading || posts.length > 0) return null;

    return (
      <View className="py-8 items-center">
        <Text className="text-gray-500">No posts available</Text>
      </View>
    );
  }, [isLoading, posts.length]);

  return (
    <FlatList
      data={isLoading ? [] : posts}
      renderItem={renderPost}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      ListHeaderComponent={renderCompleteHeader}
      ListFooterComponent={renderPostsFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 20,
        paddingBottom: 20,
        flexGrow: 1,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      extraData={isFetchingNextPage}
    />
  );
};

export default Posts;
