import SocietyMembersSettings from "@/features/societies/society-members-settings";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { View } from "react-native";

const MembersSettingsScreen = () => {
  const societyId = useGetSocietyId();

  return (
    <View className="flex-1 bg-white">
      <SocietyMembersSettings societyId={societyId} />
    </View>
  );
};

export default MembersSettingsScreen;
