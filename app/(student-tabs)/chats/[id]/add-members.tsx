import AddMembers from "@/features/chats/add-members";
import { useAppSelector } from "@/store/hooks";
import { View, Text } from "react-native";

const AddMembersScreen = () => {
  const { activeChat } = useAppSelector((state) => state.chats);

  if (!activeChat) {
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      <AddMembers chat={activeChat} />
    </View>
  );
};

export default AddMembersScreen;
