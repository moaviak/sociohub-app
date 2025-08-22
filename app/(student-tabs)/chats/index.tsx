import Chats from "@/features/chats";
import { setActiveChat } from "@/features/chats/slice";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";
import { View, Text } from "react-native";

const ChatsPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setActiveChat(undefined));
  }, []);

  return (
    <View className="flex-1 bg-white">
      <Chats />
    </View>
  );
};

export default ChatsPage;
