import Chats from "@/features/chats";
import { setActiveChat } from "@/features/chats/slice";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";
import { View } from "react-native";

const ChatsScreen = () => {
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

export default ChatsScreen;
