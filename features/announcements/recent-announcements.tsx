import { View, Text, Image, ScrollView } from "react-native";
import { useGetRecentAnnouncementsQuery } from "./api";
import { AnnouncementCard } from "./components/announcement-card";
import { Link } from "expo-router";

const RecentAnnouncements = () => {
  const { data: announcements, isLoading } = useGetRecentAnnouncementsQuery({
    limit: 3,
  });

  return (
    <View>
      <View className="flex-row gap-3 px-4 items-center">
        <Image
          source={require("@/assets/icons/megaphone.png")}
          style={{ width: 28, height: 28, objectFit: "contain" }}
        />
        <Text className="font-semibold text-xl flex-1">
          Recent Announcements
        </Text>
        <Link href={"/(student-tabs)/explore?tab=announcements"}>
          <Text className="text-xs text-gray-600">View All</Text>
        </Link>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, padding: 16, minHeight: 240 }}
      >
        {announcements?.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            variant="horizontal"
          />
        ))}
      </ScrollView>
    </View>
  );
};
export default RecentAnnouncements;
