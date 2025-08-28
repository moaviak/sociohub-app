import { View, Text, ActivityIndicator, Platform } from "react-native";
import { useGetSocietyQuery, useUpdateSocietyProfileMutation } from "./api";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SocietyProfileData, SocietyProfileSchema } from "./schema";
import { useEffect } from "react";
import ApiError from "@/store/api-error";
import { useToastUtility } from "@/hooks/useToastUtility";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { VStack } from "@/components/ui/vstack";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { ImageUpload } from "@/components/image-upload";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText } from "@/components/ui/button";

const SocietyProfileSettings: React.FC<{ societyId: string }> = ({
  societyId,
}) => {
  const toast = useToastUtility();

  const { data: society, isLoading } = useGetSocietyQuery({ societyId });
  const [updateSocietyProfile, { isLoading: isUpdating }] =
    useUpdateSocietyProfileMutation();

  const form = useForm({
    resolver: zodResolver(SocietyProfileSchema),
  });

  useEffect(() => {
    if (society) {
      form.reset({
        name: society.name,
        description: society.description || "",
        logo: undefined,
        statementOfPurpose: society.statementOfPurpose || "",
        advisorMessage: society.advisorMessage || "",
        mission: society.mission || "",
        coreValues: society.coreValues || "",
      });
    }
  }, [form, society]);

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

  const onSubmit = async (data: SocietyProfileData) => {
    const formData = new FormData();

    formData.append("description", data.description);
    if (data.logo) formData.append("logo", data.logo);
    if (data.statementOfPurpose)
      formData.append("statementOfPurpose", data.statementOfPurpose);
    if (data.advisorMessage)
      formData.append("advisorMessage", data.advisorMessage);
    if (data.mission) formData.append("mission", data.mission);
    if (data.coreValues) formData.append("coreValues", data.coreValues);

    try {
      const response = await updateSocietyProfile({
        societyId: society?.id || "",
        formData,
      }).unwrap();

      toast.showSuccessToast("Profile updated successfully");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unable to update profile";
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
        <FormControl isInvalid={!!form.formState.errors.logo}>
          <Controller
            control={form.control}
            name="logo"
            render={({ field: { onChange } }) => (
              <ImageUpload
                initialImage={society.logo}
                allowsEditing
                aspect={[1, 1]}
                maxSizeMB={10}
                onFileSelect={(file) => onChange(file)}
                onFileRemove={() => onChange()}
                uploadText="Upload Logo"
              />
            )}
          />
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.name} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Society Name</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
                isDisabled
              >
                <InputField type="text" value={value} />
              </Input>
            )}
          />
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.description}>
          <FormControlLabel>
            <FormControlLabelText>Society Vision</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea className="border border-neutral-300 rounded-lg min-h-16">
                <TextareaInput
                  placeholder="Enter your society vision here"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  className="align-top"
                />
              </Textarea>
            )}
          />
          {form.formState.errors.description && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.description?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.statementOfPurpose}>
          <FormControlLabel>
            <FormControlLabelText>
              Society Statement of Purpose
            </FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="statementOfPurpose"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea className="border border-neutral-300 rounded-lg min-h-16">
                <TextareaInput
                  placeholder="Enter your society statement of purpose here"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  className="align-top"
                />
              </Textarea>
            )}
          />
          {form.formState.errors.statementOfPurpose && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.statementOfPurpose?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.advisorMessage}>
          <FormControlLabel>
            <FormControlLabelText>Faculty Advisor Message</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="advisorMessage"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea className="border border-neutral-300 rounded-lg min-h-16">
                <TextareaInput
                  placeholder="Enter faculty advisor message here"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  className="align-top"
                />
              </Textarea>
            )}
          />
          {form.formState.errors.advisorMessage && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.advisorMessage?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.mission}>
          <FormControlLabel>
            <FormControlLabelText>Society Mission</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="mission"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea className="border border-neutral-300 rounded-lg min-h-16">
                <TextareaInput
                  placeholder="Enter your society mission here"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  className="align-top"
                />
              </Textarea>
            )}
          />
          {form.formState.errors.mission && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.mission?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.coreValues}>
          <FormControlLabel>
            <FormControlLabelText>Society Core Values</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="coreValues"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea className="border border-neutral-300 rounded-lg min-h-16">
                <TextareaInput
                  placeholder="Enter your society core values here"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  className="align-top"
                />
              </Textarea>
            )}
          />
          {form.formState.errors.coreValues && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.coreValues?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <Button
          onPress={form.handleSubmit(onSubmit)}
          className="mt-4 bg-primary-500"
          isDisabled={isUpdating}
        >
          <ButtonText>{isUpdating ? "Saving" : "Save Changes"}</ButtonText>
        </Button>
      </VStack>
    </KeyboardAwareScrollView>
  );
};

export default SocietyProfileSettings;
