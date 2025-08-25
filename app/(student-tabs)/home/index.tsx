import { VStack } from "@/components/ui/vstack";
import RecentAnnouncements from "@/features/announcements/recent-announcements";
import UpcomingEvents from "@/features/events/upcoming-events";
import Posts from "@/features/posts";
import { useAppSelector } from "@/store/hooks";
import { View } from "react-native";
import { useMemo } from "react";

const HomePage = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Memoize header components to prevent unnecessary re-renders
  const headerComponents = useMemo(
    () => (
      <VStack space="lg" className="pb-4">
        <UpcomingEvents />
        <RecentAnnouncements />
      </VStack>
    ),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Posts headerComponents={headerComponents} />
    </View>
  );
};

export default HomePage;
