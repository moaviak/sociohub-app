import React, { useState } from "react";
import { View, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Building, CheckIcon, Star, Trash2 } from "lucide-react-native";
import { Task } from "../types";
import { TaskDescriptionForm } from "./task-description-form";
import {
  useCompleteTaskMutation,
  useDeleteTaskMutation,
  useStarTaskMutation,
} from "../api";
import { useDebounceCallback } from "usehooks-ts";
import { useToastUtility } from "@/hooks/useToastUtility";
import ApiError from "@/store/api-error";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface TaskProps {
  task: Task;
  isNew?: boolean;
  onCreate?: (task: Task) => void;
  variant?: "default" | "compact";
}

export const TaskRow = ({
  task,
  isNew = false,
  onCreate,
  variant = "default",
}: TaskProps) => {
  const [completeTask] = useCompleteTaskMutation();
  const [starTask] = useStarTaskMutation();
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();
  const toast = useToastUtility();

  const [isComplete, setIsComplete] = useState(task.isCompleted);
  const [isStarred, setIsStarred] = useState(task.isStarred);

  const debouncedCompleteTask = useDebounceCallback((completed: boolean) => {
    completeTask({ id: task.id, isCompleted: completed });
  }, 400);

  const debouncedStarTask = useDebounceCallback((starred: boolean) => {
    starTask({ id: task.id, isStarred: starred });
  }, 400);

  const handleComplete = () => {
    setIsComplete((prev) => {
      const newValue = !prev;
      debouncedCompleteTask(newValue);
      return newValue;
    });
  };

  const handleStarred = () => {
    setIsStarred((prev) => {
      const newValue = !prev;
      debouncedStarTask(newValue);
      return newValue;
    });
  };

  const handleDelete = async () => {
    try {
      const response = await deleteTask({ id: task.id });

      if (!("error" in response)) {
        toast.showSuccessToast("Task successfully deleted.");
      } else {
        throw new Error("Unexpected error occurred while deleting.");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred while deleting.";

      toast.showErrorToast(message);
    }
  };

  const containerPadding = variant === "compact" ? "p-3" : "p-4";
  const iconSize = variant === "compact" ? "sm" : "md";

  if (isNew) {
    return (
      <View
        className={`flex-row items-center rounded-lg border border-gray-300 ${containerPadding} gap-2`}
      >
        <Checkbox isDisabled value="false" className="h-5 w-5">
          <CheckboxIndicator>
            <CheckboxIcon as={CheckIcon} />
          </CheckboxIndicator>
        </Checkbox>
        <View className="flex-1">
          <TaskDescriptionForm
            data={task}
            isNew
            onCreate={onCreate}
            variant={variant}
          />
        </View>
        <TouchableOpacity disabled>
          <Icon as={Star} size={iconSize} className="text-gray-400" />
        </TouchableOpacity>
        <TouchableOpacity disabled>
          <Icon as={Trash2} size={iconSize} className="text-error-400" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className={`flex-row items-center rounded-lg border border-gray-300 ${containerPadding} gap-3`}
    >
      <TouchableOpacity onPress={handleComplete}>
        <Checkbox
          isChecked={isComplete}
          value={isComplete ? "true" : "false"}
          onChange={handleComplete}
        >
          <CheckboxIndicator
            size="lg"
            style={{ borderColor: !isComplete ? "#9ca3af" : "#218bff" }}
          >
            <CheckboxIcon as={CheckIcon} className="bg-primary-500" />
          </CheckboxIndicator>
        </Checkbox>
      </TouchableOpacity>

      <View className="flex-1">
        <TaskDescriptionForm data={task} variant={variant} />
      </View>

      {task.assignedBySociety && (
        <Avatar size="sm">
          <Icon as={Building} className="text-white" />
          <AvatarImage
            source={{
              uri: task.assignedBySociety.logo || undefined,
            }}
          />
        </Avatar>
      )}

      <TouchableOpacity onPress={handleStarred}>
        <Icon
          as={Star}
          size={iconSize}
          style={{
            fill: isStarred ? "#f59e0b" : "none",
            color: isStarred ? "#f59e0b" : "#9ca3af",
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDelete}
        disabled={
          !!task.assignedBySociety || !!task.assignedBySocietyId || isLoading
        }
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <Icon as={Trash2} size={iconSize} className="text-error-400" />
        )}
      </TouchableOpacity>
    </View>
  );
};

// Skeleton component
TaskRow.Skeleton = function ({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const containerPadding = variant === "compact" ? "p-3" : "p-4";

  return (
    <View
      className={`flex-row items-center rounded-lg border border-gray-300 ${containerPadding} gap-3`}
    >
      <View className="w-5 h-5 bg-gray-200 rounded" />
      <View className="flex-1 h-5 bg-gray-200 rounded" />
      <View className="w-6 h-6 bg-gray-200 rounded" />
      <View className="w-6 h-6 bg-gray-200 rounded" />
    </View>
  );
};
