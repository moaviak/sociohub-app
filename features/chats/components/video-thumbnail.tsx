// components/VideoThumbnail.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ImageStyle,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Image as RNImage } from "react-native";
import { Play } from "lucide-react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Attachment } from "../types";

interface VideoThumbnailProps {
  attachment: Attachment;
  style: any;
  onPress: () => void;
  onLongPress?: () => void;
  playIconSize?: number;
  onError: (attachment: Attachment, error: any) => void;
  onLoad: (attachment: Attachment) => void;
  imageLoadErrors: Set<string>;
}

const generateThumbnail = async (videoUri: string): Promise<string | null> => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000,
      quality: 0.7,
    });
    return uri;
  } catch (e) {
    console.warn("Thumbnail generation failed:", e);
    return null;
  }
};

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  attachment,
  style,
  onPress,
  onLongPress,
  playIconSize = 24,
  onError,
  onLoad,
  imageLoadErrors,
}) => {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (attachment.type === "VIDEO") {
        setLoading(true);
        setThumbnailError(false);
        try {
          const thumb = await generateThumbnail(attachment.url);
          if (thumb) {
            setThumbnailUri(thumb);
            onLoad(attachment);
          } else {
            setThumbnailError(true);
            onError(attachment, new Error("Failed to generate thumbnail"));
          }
        } catch (error) {
          setThumbnailError(true);
          onError(attachment, error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadThumbnail();
  }, [attachment.url, attachment.type]);

  const ImageComponent = Platform.OS === "android" ? RNImage : Image;

  const getImageProps = () => {
    const baseStyle: ImageStyle = {
      width: "100%" as any,
      height: "100%" as any,
    };

    const baseProps = {
      source: { uri: thumbnailUri! },
      style: baseStyle,
      onError: (error: any) => {
        setThumbnailError(true);
        onError(attachment, error);
      },
      onLoad: () => onLoad(attachment),
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

  if (loading) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: "#f0f0f0",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator size="small" color="#666" />
        <Text
          style={{
            color: "#666",
            fontSize: 12,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  if (thumbnailError || !thumbnailUri || imageLoadErrors.has(attachment.id)) {
    return (
      <TouchableOpacity
        style={[
          style,
          {
            backgroundColor: "#1a1a1a",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
        delayLongPress={500}
      >
        <Play size={playIconSize + 8} color="white" fill="white" />
        <Text
          style={{
            color: "white",
            fontSize: 10,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          Video
        </Text>
      </TouchableOpacity>
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
      <ImageComponent {...getImageProps()} />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          zIndex: 1,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 999,
            width: playIconSize * 1.5,
            height: playIconSize * 1.5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Play size={playIconSize} color="#000" fill="#000" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
