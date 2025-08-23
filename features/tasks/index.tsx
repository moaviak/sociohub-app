import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { AddIcon, Icon } from "@/components/ui/icon";
import { Plus } from "lucide-react-native";
import { TaskRow } from "./components/task-row";
import { useGetUserTasksQuery } from "./api";
import { Task } from "./types";
import { Fab, FabIcon } from "@/components/ui/fab";

const TodoList = () => {
  const { data, isLoading } = useGetUserTasksQuery({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);

  useEffect(() => {
    if (data && !("error" in data)) {
      setTasks(data as Task[]);
    }
  }, [data]);

  const handleAddNewTask = () => {
    setIsAddingNewTask(true);
  };

  const handleNewTaskCreate = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setIsAddingNewTask(false);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskRow key={item.id} task={item} />
  );

  const renderSkeletons = () => (
    <VStack space="sm">
      {Array.from({ length: 5 }, (_, index) => (
        <TaskRow.Skeleton key={index} />
      ))}
    </VStack>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderSkeletons();
    }

    const allTasks = isAddingNewTask
      ? [
          {
            id: "",
            description: "",
            isCompleted: false,
            isStarred: false,
          },
          ...tasks,
        ]
      : tasks;

    return (
      <FlatList
        data={allTasks}
        renderItem={({ item, index }) => (
          <TaskRow
            key={item.id || "new-task"}
            task={item}
            isNew={index === 0 && isAddingNewTask}
            onCreate={handleNewTaskCreate}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-2" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  };

  return (
    <View className="flex-1 bg-white py-4">
      <View className="flex-1 px-4">{renderContent()}</View>
      <Fab size="lg" placement="bottom right" onPress={handleAddNewTask}>
        <FabIcon as={AddIcon} size="xl" />
      </Fab>
    </View>
  );
};

export default TodoList;
