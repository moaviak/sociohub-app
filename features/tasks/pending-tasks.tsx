import { View, Text, ScrollView, Image } from "react-native";
import { useGetUserTasksQuery } from "./api";
import { Task } from "./types";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { TaskRow } from "./components/task-row";

const PendingTasks = () => {
  const { data, isLoading } = useGetUserTasksQuery({ limit: 3 });
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (data) {
      setTasks(data as Task[]);
    }
  }, [data]);

  return (
    <View>
      <View className="flex-row gap-3 px-4 items-center">
        <Image
          source={require("@/assets/icons/tasks.png")}
          style={{ width: 28, height: 28, objectFit: "contain" }}
        />
        <Text className="font-semibold text-xl flex-1">Pending Tasks</Text>
        <Link href={"/(advisor-tabs)/menu/to-do"}>
          <Text className="text-xs text-gray-600">View All</Text>
        </Link>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 8,
          paddingVertical: 16,
        }}
      >
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ScrollView>
    </View>
  );
};

export default PendingTasks;
