import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ImageStyle,
} from "react-native";
import { Text } from "react-native";
import PagerView from "react-native-pager-view";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { Image as RNImage } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Attachment } from "../types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MediaCarouselProps {
  isOpen: boolean;
  initialIndex: number;
  attachments: Attachment[];
  onClose: () => void;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  isOpen,
  initialIndex,
  onClose,
  attachments,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const pagerRef = useRef<PagerView>(null);
  const insets = useSafeAreaInsets();

  // Use React Native Image on Android as fallback due to Glide issues
  const ImageComponent = Platform.OS === "android" ? RNImage : Image;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      if (pagerRef.current) {
        // Small delay to ensure pager is rendered
        setTimeout(() => {
          pagerRef.current?.setPage(initialIndex);
        }, 100);
      }
    }
  }, [isOpen]); // Only depend on isOpen, not initialIndex

  const handlePageSelected = (e: any) => {
    setCurrentIndex(e.nativeEvent.position);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % attachments.length;
    setCurrentIndex(nextIndex);
    pagerRef.current?.setPage(nextIndex);
  };

  const prevImage = () => {
    const prevIndex =
      (currentIndex - 1 + attachments.length) % attachments.length;
    setCurrentIndex(prevIndex);
    pagerRef.current?.setPage(prevIndex);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    pagerRef.current?.setPage(index);
  };

  // Helper function to get proper image source
  const getImageSource = (attachment: Attachment) => {
    if (typeof attachment.url === "string") {
      return { uri: attachment.url };
    }
    return attachment.url;
  };

  // Get image props based on platform
  const getImageProps = (attachment: Attachment) => {
    const baseStyle: ImageStyle = {
      width: screenWidth - 48,
      height: screenHeight - 200,
      maxWidth: screenWidth - 48,
      maxHeight: screenHeight - 200,
    };

    const baseProps = {
      source: getImageSource(attachment),
      style: baseStyle,
    };

    if (Platform.OS === "android") {
      return {
        ...baseProps,
        resizeMode: "contain" as const,
      };
    } else {
      return {
        ...baseProps,
        contentFit: "contain" as const,
        transition: 200,
        cachePolicy: "memory-disk" as const,
      };
    }
  };

  // Video component with player
  const VideoComponent = ({ attachment }: { attachment: Attachment }) => {
    const player = useVideoPlayer(attachment.url, (player) => {
      player.loop = false;
      player.muted = false;
    });

    return (
      <VideoView
        style={{
          width: screenWidth - 48,
          height: screenHeight - 200,
        }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
        nativeControls
      />
    );
  };

  const renderMediaItem = (attachment: Attachment, index: number) => (
    <View
      key={attachment.id}
      style={{
        width: screenWidth,
        height: screenHeight,
        backgroundColor: "black",
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {attachment.type === "IMAGE" ? (
          <ImageComponent {...getImageProps(attachment)} />
        ) : (
          <VideoComponent attachment={attachment} />
        )}
      </View>
    </View>
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={false}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={{ flex: 1, backgroundColor: "black" }}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: insets.top + 16,
            right: 16,
            zIndex: 20,
            width: 40,
            height: 40,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <X size={20} color="white" />
        </TouchableOpacity>

        {/* Navigation Buttons */}
        {attachments.length > 1 && (
          <>
            <TouchableOpacity
              onPress={prevImage}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                zIndex: 20,
                width: 40,
                height: 40,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -20,
              }}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={nextImage}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                zIndex: 20,
                width: 40,
                height: 40,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -20,
              }}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          </>
        )}

        {/* Carousel */}
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={initialIndex}
          onPageSelected={handlePageSelected}
        >
          {attachments.map((attachment, index) =>
            renderMediaItem(attachment, index)
          )}
        </PagerView>

        {/* Indicators */}
        {attachments.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 64,
              left: "50%",
              zIndex: 20,
              flexDirection: "row",
              gap: 8,
              transform: [{ translateX: -((attachments.length * 16 - 8) / 2) }],
            }}
          >
            {attachments.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentIndex
                      ? "white"
                      : "rgba(255, 255, 255, 0.5)",
                }}
                onPress={() => goToImage(index)}
                activeOpacity={0.7}
              />
            ))}
          </View>
        )}

        {/* Counter */}
        {attachments.length > 1 && (
          <View
            style={{
              position: "absolute",
              top: insets.top + 16,
              left: 16,
              zIndex: 20,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 14,
              }}
            >
              {currentIndex + 1} / {attachments.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};
