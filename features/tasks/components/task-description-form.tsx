import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { Input, InputField } from "@/components/ui/input";
import { Task } from "../types";
import { useUpdateTaskMutation, useCreateTaskMutation } from "../api";
import { useToastUtility } from "@/hooks/useToastUtility";

interface TaskDescriptionFormProps {
  data: Task;
  isNew?: boolean;
  onCreate?: (task: Task) => void;
  variant?: "default" | "compact";
}

export const TaskDescriptionForm = ({
  data,
  isNew = false,
  onCreate,
  variant = "default",
}: TaskDescriptionFormProps) => {
  const inputRef = useRef<TextInput>(null);
  const toast = useToastUtility();
  const isSubmittingRef = useRef(false); // Track if we're already submitting

  const [description, setDescription] = useState(data.description);
  const [isEditing, setIsEditing] = useState(isNew);

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  useEffect(() => {
    if (isNew && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isNew]);

  const enableEditing = () => {
    if (data.assignedBySociety || data.assignedBySocietyId) {
      return;
    }
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const disableEditing = () => {
    setIsEditing(false);
    isSubmittingRef.current = false; // Reset the flag when disabling editing
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (!description.trim()) {
      toast.showErrorToast("Task description cannot be empty.");
      return;
    }

    if (isCreating || isUpdating || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true; // Set flag to prevent duplicate calls

    if (isNew && onCreate) {
      try {
        const response = await createTask({ description });
        if (!("error" in response) && !("error" in response.data)) {
          toast.showSuccessToast("Task created.");
          onCreate(response.data);
          disableEditing();
        } else {
          throw new Error("Api error.");
        }
      } catch (error) {
        toast.showErrorToast("Failed to create task.");
        console.error(error);
        isSubmittingRef.current = false; // Reset flag on error
      }
    } else {
      try {
        const response = await updateTask({ id: data.id, description });
        if (!("error" in response) && !("error" in response.data)) {
          toast.showSuccessToast("Task description updated.");
          setDescription(response.data.description);
          disableEditing();
        } else {
          throw new Error("Api error.");
        }
      } catch (error) {
        toast.showErrorToast("Failed to update task description.");
        console.error(error);
        isSubmittingRef.current = false; // Reset flag on error
      }
    }
  };

  const handleBlur = () => {
    // Only handle blur if we haven't already started submitting
    if (isSubmittingRef.current) {
      return;
    }

    if (description.trim()) {
      handleSubmit();
    } else {
      disableEditing();
      setDescription(data.description);
    }
  };

  const handleSubmitEditing = () => {
    // This will be called when Enter key is pressed
    handleSubmit();
  };

  if (isEditing) {
    return (
      <View className="flex-1">
        <Input ref={inputRef} className="border-0 bg-transparent">
          <InputField
            value={description}
            onChangeText={setDescription}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="done"
            className={`text-gray-700 ${
              variant === "compact" ? "text-sm px-0" : "text-base px-0"
            }`}
            placeholder="Enter task description..."
          />
        </Input>
      </View>
    );
  }

  const isDisabled = !!data.assignedBySociety || !!data.assignedBySocietyId;

  return (
    <TouchableOpacity
      onPress={enableEditing}
      disabled={isDisabled}
      className="flex-1 justify-center py-2"
    >
      <Text
        className={`text-gray-700 ${
          variant === "compact" ? "text-sm" : "text-base"
        } ${isDisabled ? "opacity-60" : ""}`}
        numberOfLines={2}
      >
        {description || "Tap to add description..."}
      </Text>
    </TouchableOpacity>
  );
};
