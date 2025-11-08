import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useDebounceCallback } from "usehooks-ts";
import { useGetSocietyEventsInfiniteQuery } from "./api";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "lucide-react-native";
import { EventCard } from "./components/event-card";
import { IOScrollView, InView } from "react-native-intersection-observer";

const SocietyEvents = ({ societyId }: { societyId: string }) => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useGetSocietyEventsInfiniteQuery({
    societyId: societyId,
    limit: 10,
    page: 1,
  });
  const events = data?.pages?.flatMap((page) => page.events) ?? [];

  const handleInputChange = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
  };

  const handleIntersection = useCallback(
    (inView: boolean) => {
      if (inView && hasNextPage && !isFetchingNextPage && !isFetching) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]
  );

  const renderLoadingFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-gray-500 mt-2 text-sm">
          Loading more events...
        </Text>
      </View>
    );
  };

  const renderEndMessage = () => {
    if (events.length === 0 || hasNextPage || isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <Text className="text-gray-500 text-sm">You've reached the end</Text>
      </View>
    );
  };

  // Check if we should show loading state
  const shouldShowLoading = isLoading || (isFetching && !events);

  return (
    <IOScrollView
      showsVerticalScrollIndicator={false}
      className="p-6"
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <VStack space="xl" className="flex-1">
        {/* Search Input */}
        <Input size="lg" className="px-4 rounded-xl">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder="Search Events..."
            value={input}
            onChangeText={handleInputChange}
          />
        </Input>

        <VStack space="md" style={{ marginBottom: 16 }}>
          {shouldShowLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" />
            </View>
          ) : events && events.length > 0 ? (
            <>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}

              {/* Infinite Scroll Trigger */}
              {hasNextPage && (
                <InView
                  onChange={handleIntersection}
                  threshold={0.1}
                  rootMargin="100px"
                >
                  <View style={{ height: 20 }}>
                    {/* Invisible trigger element */}
                  </View>
                </InView>
              )}

              {/* Loading Footer */}
              {renderLoadingFooter()}

              {/* End Message */}
              {renderEndMessage()}
            </>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">No events found</Text>
            </View>
          )}
        </VStack>
      </VStack>
    </IOScrollView>
  );
};

export default SocietyEvents;
