import { View, Text, ScrollView, Image } from "react-native";
import { useGetEventsQuery, useGetSocietyEventsQuery } from "./api";
import { EventCard } from "./components/event-card";
import { Link } from "expo-router";

const UpcomingEvents: React.FC<{ societyId?: string }> = ({ societyId }) => {
  const { data: events } = useGetEventsQuery(
    {
      limit: 3,
      status: "Upcoming",
    },
    {
      skip: !!societyId,
    }
  );

  const { data: societyEvents } = useGetSocietyEventsQuery(
    {
      societyId: societyId || "",
      status: "Upcoming",
    },
    {
      skip: !societyId,
    }
  );

  return (
    <View>
      <View className="flex-row gap-3 px-4 items-center">
        <Image
          source={require("@/assets/icons/calendar.png")}
          style={{ width: 28, height: 28, objectFit: "contain" }}
        />
        <Text className="font-semibold text-xl flex-1">Upcoming Events</Text>
        <Link
          href={
            societyId
              ? "/(advisor-tabs)/events"
              : "/(student-tabs)/explore?tab=events"
          }
        >
          <Text className="text-xs text-gray-600">View All</Text>
        </Link>
      </View>
      <ScrollView
        horizontal={!societyId}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
          padding: 16,
          height: !societyId ? 360 : "auto",
        }}
      >
        {!societyId
          ? events?.map((event) => (
              <EventCard key={event.id} event={event} variant="vertical" />
            ))
          : societyEvents?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
      </ScrollView>
    </View>
  );
};

export default UpcomingEvents;
