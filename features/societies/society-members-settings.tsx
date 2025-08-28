import { useToastUtility } from "@/hooks/useToastUtility";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { useGetSocietyQuery, useUpdateSocietySettingsMutation } from "./api";
import { Controller, useForm } from "react-hook-form";
import { SocietySettingsSchema, SocietySettingsValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import ApiError from "@/store/api-error";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { VStack } from "@/components/ui/vstack";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Switch } from "@/components/ui/switch";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";

const SocietyMembersSettings: React.FC<{ societyId: string }> = ({
  societyId,
}) => {
  const toast = useToastUtility();

  const [originalValues, setOriginalValues] =
    useState<SocietySettingsValues | null>(null);
  const [formChanged, setFormChanged] = useState(false);

  const { data: society, isLoading } = useGetSocietyQuery({ societyId });
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSocietySettingsMutation();

  const form = useForm({
    resolver: zodResolver(SocietySettingsSchema),
  });

  useEffect(() => {
    if (society) {
      const defaultValues = {
        acceptingNewMembers: society.acceptingNewMembers ?? false,
        membersLimit: society.membersLimit ?? 40,
      };

      setOriginalValues(defaultValues);
      form.reset(defaultValues);
    }
  }, [form, society]);

  // Check if form values have changed from original values
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!originalValues) return;

      const isChanged =
        values.acceptingNewMembers !== originalValues.acceptingNewMembers ||
        values.membersLimit !== originalValues.membersLimit;

      setFormChanged(isChanged);
    });

    return () => subscription.unsubscribe();
  }, [form, originalValues]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!society) {
    return null;
  }

  const onSubmit = async (values: SocietySettingsValues) => {
    try {
      await updateSettings({ societyId, ...values }).unwrap();
      toast.showSuccessToast("Settings updated successfully");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "An unexpected error occurred";

      toast.showErrorToast(message);
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 100 : 30}
      keyboardShouldPersistTaps="handled"
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <VStack space="md" className="p-4">
        <FormControl>
          <View className="flex-row items-center justify-between rounded-lg border border-neutral-300 p-3">
            <View className="flex-1">
              <FormControlLabel>
                <FormControlLabelText className="font-medium">
                  New members requests
                </FormControlLabelText>
              </FormControlLabel>
              <Text className="text-sm text-gray-600 mt-1">
                Open members registration and receive new members requests.
              </Text>
            </View>
            <Controller
              control={form.control}
              name="acceptingNewMembers"
              render={({ field: { onChange, value } }) => (
                <Switch
                  trackColor={{ false: "#d1d5db", true: "#7ab9ff" }}
                  thumbColor={"#218bff"}
                  value={value}
                  onValueChange={onChange}
                  className="ml-3"
                />
              )}
            />
          </View>
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.membersLimit}>
          <FormControlLabel>
            <FormControlLabelText>Members Limit</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="membersLimit"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  keyboardType="number-pad"
                  value={value?.toString()}
                  onChangeText={(value) =>
                    onChange(value ? parseInt(value) : null)
                  }
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          {form.formState.errors.membersLimit && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.membersLimit?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        {formChanged && (
          <Button
            onPress={form.handleSubmit(onSubmit)}
            className="mt-4 bg-primary-500"
            isDisabled={isUpdating}
          >
            <ButtonText>{isUpdating ? "Saving" : "Save"}</ButtonText>
          </Button>
        )}
      </VStack>
    </KeyboardAwareScrollView>
  );
};

export default SocietyMembersSettings;
