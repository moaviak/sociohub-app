// components/MediaGrid.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Image as RNImage } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { VideoThumbnail } from "./video-thumbnail";
import { Attachment } from "../types";

const { width: screenWidth } = Dimensions.get("window");
const maxImageWidth = screenWidth * 0.65;

interface MediaGridProps {
  attachments: Attachment[];
  onAttachmentPress: (index: number) => void;
  imageLoadErrors: Set<string>;
  onImageError: (attachment: Attachment, error: any) => void;
  onImageLoad: (attachment: Attachment) => void;
  onLongPress?: () => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  attachments,
  onAttachmentPress,
  imageLoadErrors,
  onImageError,
  onImageLoad,
  onLongPress,
}) => {
  if (!attachments || attachments.length === 0) return null;

  const displayAttachments = attachments.slice(0, 4);
  const remainingCount = Math.max(0, attachments.length - 4);

  const ImageComponent = Platform.OS === "android" ? RNImage : Image;

  const getImageSource = (attachment: Attachment) => {
    if (attachment.type === "VIDEO") {
      return undefined;
    }
    return typeof attachment.url === "string"
      ? { uri: attachment.url }
      : attachment.url;
  };

  const getImageProps = (attachment: Attachment) => {
    const baseStyle = {
      width: "100%" as any,
      height: "100%" as any,
    };

    const baseProps = {
      source: getImageSource(attachment),
      style: baseStyle,
      onError: (error: any) => onImageError(attachment, error),
      onLoad: () => onImageLoad(attachment),
    };

    if (Platform.OS === "android") {
      return {
        ...baseProps,
        resizeMode: "cover" as const,
      };
    } else {
      return {
        ...baseProps,
        contentFit: "cover" as const,
        cachePolicy: "memory-disk" as const,
        placeholder: { blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" },
        transition: 200,
      };
    }
  };

  const renderMediaItem = (
    attachment: Attachment,
    style: any,
    onPress: () => void,
    playIconSize: number = 24
  ) => {
    if (attachment.type === "VIDEO") {
      return (
        <VideoThumbnail
          attachment={attachment}
          style={style}
          onPress={onPress}
          onLongPress={onLongPress}
          playIconSize={playIconSize}
          onError={onImageError}
          onLoad={onImageLoad}
          imageLoadErrors={imageLoadErrors}
        />
      );
    }

    return (
      <TouchableOpacity
        style={style}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
        delayLongPress={500}
      >
        <ImageComponent {...getImageProps(attachment)} />
        {imageLoadErrors.has(attachment.id) && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <AlertCircle size={20} color="white" />
            <Text style={{ color: "white", fontSize: 12, marginTop: 4 }}>
              Failed to load
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const itemStyle = {
    borderRadius: 8,
    overflow: "hidden" as const,
    backgroundColor: "#f0f0f0",
    position: "relative" as const,
  };

  const renderGrid = () => {
    if (displayAttachments.length === 1) {
      return renderMediaItem(
        displayAttachments[0],
        {
          ...itemStyle,
          width: maxImageWidth - 8,
          height: maxImageWidth - 8,
        },
        () => onAttachmentPress(0),
        32
      );
    }

    if (displayAttachments.length === 2) {
      return (
        <View style={{ flexDirection: "row", gap: 4 }}>
          {displayAttachments.map((attachment, index) => (
            <View key={attachment.id}>
              {renderMediaItem(
                attachment,
                {
                  ...itemStyle,
                  width: (maxImageWidth - 12) / 2,
                  height: (maxImageWidth - 12) / 2,
                },
                () => onAttachmentPress(index),
                24
              )}
            </View>
          ))}
        </View>
      );
    }

    if (displayAttachments.length === 3) {
      return (
        <View style={{ gap: 4 }}>
          {renderMediaItem(
            displayAttachments[0],
            {
              ...itemStyle,
              width: maxImageWidth - 8,
              height: (maxImageWidth - 8) / 2,
            },
            () => onAttachmentPress(0),
            28
          )}
          <View style={{ flexDirection: "row", gap: 4 }}>
            {displayAttachments.slice(1).map((attachment, index) => {
              const actualIndex =
                attachments.findIndex((att) => att.id === attachment.id) ??
                index + 1;
              return (
                <View key={attachment.id}>
                  {renderMediaItem(
                    attachment,
                    {
                      ...itemStyle,
                      width: (maxImageWidth - 12) / 2,
                      height: (maxImageWidth - 12) / 2,
                    },
                    () => onAttachmentPress(actualIndex),
                    20
                  )}
                </View>
              );
            })}
          </View>
        </View>
      );
    }

    // 4 or more items
    return (
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {displayAttachments.slice(0, 2).map((attachment, index) => {
            const actualIndex =
              attachments.findIndex((att) => att.id === attachment.id) ?? index;
            return (
              <View key={attachment.id}>
                {renderMediaItem(
                  attachment,
                  {
                    ...itemStyle,
                    width: (maxImageWidth - 12) / 2,
                    height: (maxImageWidth - 12) / 2,
                  },
                  () => onAttachmentPress(actualIndex),
                  20
                )}
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {displayAttachments.slice(2, 4).map((attachment, index) => {
            const actualIndex =
              attachments.findIndex((att) => att.id === attachment.id) ??
              index + 2;
            const baseStyle = {
              ...itemStyle,
              width: (maxImageWidth - 12) / 2,
              height: (maxImageWidth - 12) / 2,
            };

            return (
              <View key={attachment.id} style={baseStyle}>
                {renderMediaItem(
                  attachment,
                  baseStyle,
                  () => onAttachmentPress(actualIndex),
                  20
                )}
                {index === 1 &&
                  remainingCount > 0 &&
                  !imageLoadErrors.has(attachment.id) && (
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        zIndex: 3,
                      }}
                      onPress={() => onAttachmentPress(actualIndex)}
                      onLongPress={onLongPress}
                      activeOpacity={0.8}
                      delayLongPress={500}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "600",
                          fontSize: 18,
                        }}
                      >
                        +{remainingCount}
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        padding: 4,
        width: maxImageWidth,
        backgroundColor: "transparent",
      }}
    >
      {renderGrid()}
    </View>
  );
};
