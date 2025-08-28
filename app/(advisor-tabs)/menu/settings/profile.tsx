import SocietyProfileSettings from "@/features/societies/society-profile-settings";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { View } from "react-native";

const ProfileSettingsScreen = () => {
  const societyId = useGetSocietyId();

  return (
    <View className="flex-1 bg-white">
      <SocietyProfileSettings societyId={societyId} />
    </View>
  );
};

export default ProfileSettingsScreen;
