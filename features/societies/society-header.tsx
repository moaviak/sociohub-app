import { View, Text, Dimensions } from "react-native";
import { useGetSocietyKPIsQuery, useGetSocietyQuery } from "./api";
import { Icon } from "@/components/ui/icon";
import { CalendarClock, FilePen, Users } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

const SocietyHeader: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { data } = useGetSocietyKPIsQuery(societyId);
  const { data: society } = useGetSocietyQuery({ societyId });

  const cardWidth = screenWidth * 0.85;

  return (
    <View
      className="w-full bg-primary-500 items-center relative"
      style={{
        paddingVertical: 32,
        paddingHorizontal: 32,
        height: 172,
        marginBottom: 72,
      }}
    >
      <Text className="font-bold text-2xl text-white text-center">
        {society?.name}
      </Text>
      <View
        className="bg-white absolute flex-row items-center p-4 rounded-xl"
        style={{
          width: cardWidth,
          bottom: "-50%",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
          justifyContent: "space-around",
        }}
      >
        <View className="items-center gap-1">
          <View
            className="items-center justify-center p-3 bg-primary-100/50 rounded-full"
            // style={{ width: 40, height: 40 }}
          >
            <Icon
              as={Users}
              className="text-primary-500"
              style={{
                width: 24,
                height: 24,
              }}
            />
          </View>
          <Text className="text-xs text-gray-600">Total Members</Text>
          <Text className="font-semibold text-xl mt-1">
            {data ? data.members : 0}
          </Text>
        </View>

        <View className="items-center gap-1">
          <View
            className="items-center justify-center p-3 bg-secondary-100/50 rounded-full"
            // style={{ width: 40, height: 40 }}
          >
            <Icon
              as={CalendarClock}
              className="text-secondary-500"
              style={{
                width: 24,
                height: 24,
              }}
            />
          </View>
          <Text className="text-xs text-gray-600">Live Events</Text>
          <Text className="font-semibold text-xl mt-1">
            {data ? data.activeEvents : 0}
          </Text>
        </View>

        <View className="items-center gap-1">
          <View className="items-center justify-center bg-warning-100/50 p-3 rounded-full">
            <Icon
              as={FilePen}
              className="text-warning-500"
              style={{
                width: 24,
                height: 24,
              }}
            />
          </View>
          <Text className="text-xs text-gray-600">Registrations</Text>
          <Text className="font-semibold text-xl mt-1">
            {data ? data.upcomingEventRegistrations : 0}
          </Text>
        </View>
      </View>
    </View>
  );
};
export default SocietyHeader;
