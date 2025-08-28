import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { ChevronRight, IdCard, Users } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

const SettingsScreen = () => {
  return (
    <View className="bg-white flex-1 justify-between py-2">
      <VStack>
        <TouchableOpacity
          className="flex-row items-center gap-4 py-4 px-6  border-b border-neutral-300"
          activeOpacity={0.7}
          onPress={() => router.push("/(advisor-tabs)/menu/settings/profile")}
        >
          <IdCard size={24} color="#333" />
          <Text className="font-body text-lg font-medium flex-1">
            Public Profile
          </Text>
          <Icon as={ChevronRight} color="#333" size="lg" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-4 py-4 px-6  border-b border-neutral-300"
          activeOpacity={0.7}
          onPress={() => router.push("/(advisor-tabs)/menu/settings/members")}
        >
          <Users size={24} color="#333" />
          <Text className="font-body text-lg font-medium flex-1">
            Members & Requests
          </Text>
          <Icon as={ChevronRight} color="#333" size="lg" />
        </TouchableOpacity>
      </VStack>
    </View>
  );
};

export default SettingsScreen;
