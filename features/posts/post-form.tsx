import React, { useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { Post } from "./types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostFormData, postFormSchema } from "./schema";
import { Event } from "../events/types";
import { useCreatePostMutation, useUpdatePostMutation } from "./api";
import { useToastUtility } from "@/hooks/useToastUtility";
import { useRouter } from "expo-router";
import ApiError from "@/store/api-error";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { VStack } from "@/components/ui/vstack";
import {
  FormControl,
  FormControlLabelText,
  FormControlLabel,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText } from "@/components/ui/button";
import MediaUploader from "@/components/media-uploader";
import { EventFlyoutSearch } from "./components/event-flyout-search";

const PostForm: React.FC<{ societyId: string; post?: Post }> = ({
  societyId,
  post,
}) => {
  const toast = useToastUtility();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(postFormSchema(!!post, post?.media || [])),
    defaultValues: {
      content: post?.content ?? "",
      media: [],
      removedMediaIds: [],
    },
  });

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(
    post?.event ?? null
  );

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const handleSubmit = async (data: PostFormData) => {
    const formData = new FormData();
    if (data.content) formData.append("content", data.content);
    formData.append("societyId", societyId);

    if (data.eventId) {
      formData.append("eventId", data.eventId);
    } else if (post?.eventId) {
      // If event was previously linked but now cleared
      formData.append("eventId", ""); // Send empty string to clear eventId
    }

    if (data.media) {
      data.media.forEach((file) => {
        formData.append("media", file);
      });
    }

    if (data.removedMediaIds && data.removedMediaIds.length > 0) {
      formData.append("removedMediaIds", JSON.stringify(data.removedMediaIds));
    }

    try {
      let response: Post;
      if (post) {
        // Update existing post
        response = await updatePost({
          postId: post.id,
          data: formData,
        }).unwrap();
        toast.showSuccessToast("Post successfully updated.");
      } else {
        // Create new post
        response = await createPost(formData).unwrap();
        toast.showSuccessToast("Post successfully created.");
      }
      form.reset();
      router.back();
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unexpected error occurred.";
      toast.showErrorToast(message);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    form.setValue("eventId", event.id);
  };

  const handleClearEvent = () => {
    setSelectedEvent(null);
    form.setValue("eventId", undefined);
  };

  const handleRemoteImageRemove = ({ id }: { id?: string }) => {
    if (id) {
      const currentRemovedIds = form.getValues("removedMediaIds") || [];
      const updatedRemovedIds = [...currentRemovedIds, id];
      form.setValue("removedMediaIds", updatedRemovedIds);

      // Trigger validation to check if we still have enough media
      form.trigger(["media", "removedMediaIds"]);
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 100 : 30}
      keyboardShouldPersistTaps="handled"
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: 100, // Increased bottom padding
        flexGrow: 1,
      }}
    >
      <VStack space="md" className="p-4" style={{ minHeight: "100%" }}>
        {/* Content Field */}
        <FormControl isInvalid={!!form.formState.errors.content} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Post Content</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="content"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea className="border border-neutral-300 rounded-lg min-h-20">
                <TextareaInput
                  placeholder="Start writing your post content here..."
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
          {form.formState.errors.content && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.content?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        {/* Media Field */}
        <FormControl isInvalid={!!form.formState.errors.media} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Post Media</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="media"
            render={({ field }) => (
              <MediaUploader
                onFilesChange={(files) => {
                  field.onChange(files);
                  // Trigger validation when files change
                  form.trigger(["media", "removedMediaIds"]);
                }}
                onRemoteMediaRemove={handleRemoteImageRemove}
                placeholderText="Tap to upload images and videos"
                multiple
                acceptVideos
                existingMedia={post?.media?.map((media) => ({
                  id: media.id,
                  url: media.url,
                }))}
              />
            )}
          />
          {form.formState.errors.media && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.media?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        {/* Event Field - Added extra space for dropdown */}
        <View>
          {/* Extra space for dropdown */}
          <FormControl isInvalid={!!form.formState.errors.eventId}>
            <FormControlLabel>
              <FormControlLabelText>
                Connect to Event (Optional)
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <EventFlyoutSearch
                  societyId={societyId}
                  selectedEvent={selectedEvent}
                  onSelect={handleSelectEvent}
                  onClear={handleClearEvent}
                />
              )}
            />
            {form.formState.errors.eventId && (
              <FormControlError>
                <FormControlErrorText>
                  {form.formState.errors.eventId?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </View>

        {/* Submit Button - Now at the bottom with proper spacing */}
        <View
          style={{
            marginTop: "auto",
            paddingBottom: Platform.OS === "ios" ? 34 : 24, // Account for safe area
            zIndex: -999,
          }}
        >
          <Button
            isDisabled={isCreating || isUpdating}
            onPress={form.handleSubmit(handleSubmit)}
            className="w-full"
          >
            <ButtonText>
              {post
                ? !isUpdating
                  ? "Update Post"
                  : "Updating..."
                : !isCreating
                ? "Create Post"
                : "Creating..."}
            </ButtonText>
          </Button>
        </View>
      </VStack>
    </KeyboardAwareScrollView>
  );
};

export default PostForm;
