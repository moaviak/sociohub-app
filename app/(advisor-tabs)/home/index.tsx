import UpcomingEvents from "@/features/events/upcoming-events";
import SocietyHeader from "@/features/societies/society-header";
import PendingTasks from "@/features/tasks/pending-tasks";
import { useAppSelector } from "@/store/hooks";
import { Advisor } from "@/types";
import { View, Text, ScrollView } from "react-native";

const HomePage = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!(user as Advisor).societyId) return null;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{
        paddingBottom: 20,
        gap: 16,
      }}
    >
      <SocietyHeader societyId={(user as Advisor).societyId!} />
      <PendingTasks />
      <UpcomingEvents societyId={(user as Advisor).societyId!} />
    </ScrollView>
  );
};

export default HomePage;
