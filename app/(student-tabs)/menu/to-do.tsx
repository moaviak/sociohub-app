import ToDoList from "@/features/tasks";
import { View } from "react-native";

const ToDoScreen = () => {
  return (
    <View className="flex-1 bg-white">
      <ToDoList />
    </View>
  );
};

export default ToDoScreen;
