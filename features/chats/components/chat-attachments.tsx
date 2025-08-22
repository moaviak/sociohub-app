import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import {
  File,
  FileVideo,
  Images,
  Paperclip,
  X,
  ArrowLeft,
  Send,
  Plus,
  Play,
  Pause,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import { IUser, Message, Attachment } from "../types";
import { DocumentIcon } from "./document-icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSendMessageMutation } from "../api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMessage, updateMessage } from "../slice";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface FileItem {
  uri: string;
  type: string;
  name: string;
  size: number;
  id: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_FILES = 5;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

type AttachmentMode = "main" | "preview";
type PreviewType = "images" | "videos" | "documents" | "";

// Video component for individual video files
const VideoPlayerComponent: React.FC<{
  file: FileItem;
  isActive: boolean;
  onTogglePlay: (playing: boolean) => void;
}> = ({ file, isActive, onTogglePlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(file.uri, (player) => {
    player.loop = false;
    player.muted = false;
  });

  // Pause when not active (when scrolling to different video)
  useEffect(() => {
    if (!isActive && isPlaying) {
      player.pause();
      setIsPlaying(false);
      onTogglePlay(false);
    }
  }, [isActive, isPlaying, player, onTogglePlay]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.release();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [player]);

  const handleTogglePlay = () => {
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
        onTogglePlay(false);
      } else {
        player.play();
        setIsPlaying(true);
        onTogglePlay(true);
      }
    } catch (error) {
      console.error("Error controlling video playback:", error);
    }
  };

  return (
    <View style={{ position: "relative", flex: 1 }}>
      <VideoView
        style={{
          width: screenWidth - 32,
          height: "100%",
          borderRadius: 12,
        }}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="contain"
        nativeControls={false}
      />

      <TouchableOpacity
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: 12,
        }}
        onPress={handleTogglePlay}
        activeOpacity={0.7}
      >
        {isPlaying ? (
          <Pause size={48} color="#fff" />
        ) : (
          <Play size={48} color="#fff" />
        )}
      </TouchableOpacity>

      {/* File info overlay */}
      <View
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: 8,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: "500",
          }}
          numberOfLines={1}
        >
          {file.name}
        </Text>
        <Text
          style={{
            color: "#ccc",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {formatFileSize(file.size)}
        </Text>
      </View>
    </View>
  );
};

export const ChatAttachments: React.FC<{ currentSender: IUser }> = ({
  currentSender,
}) => {
  const [sendMessage] = useSendMessageMutation();
  const { activeChat } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AttachmentMode>("main");
  const [previewType, setPreviewType] = useState<PreviewType>("");
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [caption, setCaption] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sizeError, setSizeError] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const validateFileSize = (size: number, fileName: string): boolean => {
    if (size > MAX_FILE_SIZE) {
      setSizeError(
        `File "${fileName}" is too large. Maximum size allowed is ${formatFileSize(
          MAX_FILE_SIZE
        )}.`
      );
      return false;
    }
    return true;
  };

  // Helper function to check file sizes before selection
  const checkFileSizes = async (assets: any[]) => {
    const oversizedFiles: string[] = [];

    for (const asset of assets) {
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        const fileName = asset.fileName || asset.name || "Unknown file";
        oversizedFiles.push(fileName);
      }
    }

    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.join(", ");
      Alert.alert(
        "File Size Limit Exceeded",
        `The following files are too large (max ${formatFileSize(
          MAX_FILE_SIZE
        )}):\n${fileList}`,
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const handleAttachmentPress = () => {
    setIsOpen(!isOpen);
    setSizeError("");
  };

  // Create file object for React Native FormData (similar to ImageUpload pattern)
  const createFileObject = (
    asset: any,
    fileType: "image" | "video" | "document"
  ): FileItem => {
    let fileName: string;
    let fileExtension: string;
    let mimeType: string;

    if (fileType === "document") {
      // For documents, use the provided name and mimeType
      fileName = asset.name;
      mimeType = asset.mimeType || "application/octet-stream";
    } else {
      // For images and videos, create proper names and types
      const uriParts = asset.uri.split(".");
      fileExtension =
        uriParts[uriParts.length - 1] || (fileType === "image" ? "jpg" : "mp4");

      // Ensure valid extensions
      if (!fileExtension || fileExtension.length > 4) {
        fileExtension = fileType === "image" ? "jpg" : "mp4";
      }

      fileName = asset.fileName || `${fileType}_${Date.now()}.${fileExtension}`;

      // Set proper MIME type
      if (fileType === "image") {
        mimeType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;
      } else {
        mimeType = `video/${fileExtension}`;
      }
    }

    return {
      uri: asset.uri,
      type: mimeType,
      name: fileName,
      size: asset.fileSize || asset.size || 0,
      id: Math.random().toString(36).substr(2, 9),
    };
  };

  // Updated handlers using the new createFileObject function
  const handlePhotosPress = async () => {
    setSizeError("");

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_FILES,
    });

    if (!result.canceled && result.assets.length > 0) {
      const sizesValid = await checkFileSizes(result.assets);
      if (!sizesValid) return;

      const validFiles: FileItem[] = [];

      result.assets.forEach((asset) => {
        if (asset.uri && asset.fileSize) {
          if (validateFileSize(asset.fileSize, asset.fileName || "image")) {
            const fileObject = createFileObject(asset, "image");
            validFiles.push(fileObject);
          }
        }
      });

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setPreviewType("images");
        setMode("preview");
        setCurrentIndex(0);
      }
    }
  };

  const handleVideosPress = async () => {
    setSizeError("");

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_FILES,
    });

    if (!result.canceled && result.assets.length > 0) {
      const sizesValid = await checkFileSizes(result.assets);
      if (!sizesValid) return;

      const validFiles: FileItem[] = [];

      result.assets.forEach((asset) => {
        if (asset.uri && asset.fileSize) {
          if (validateFileSize(asset.fileSize, asset.fileName || "video")) {
            const fileObject = createFileObject(asset, "video");
            validFiles.push(fileObject);
          }
        }
      });

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setPreviewType("videos");
        setMode("preview");
        setCurrentIndex(0);
      }
    }
  };

  const handleDocumentsPress = async () => {
    setSizeError("");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const sizesValid = await checkFileSizes(result.assets);
        if (!sizesValid) return;

        const validFiles: FileItem[] = [];

        result.assets.forEach((asset) => {
          if (asset.uri && asset.size) {
            if (validateFileSize(asset.size, asset.name)) {
              const fileObject = createFileObject(asset, "document");
              validFiles.push(fileObject);
            }
          }
        });

        if (validFiles.length > 0) {
          setSelectedFiles(validFiles.slice(0, MAX_FILES));
          setPreviewType("documents");
          setMode("preview");
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      Alert.alert("Error", "Failed to select documents");
    }
  };

  const handleAddMore = async () => {
    const remainingSlots = MAX_FILES - selectedFiles.length;
    if (remainingSlots <= 0) return;

    setSizeError("");

    try {
      if (previewType === "images") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"], // Fixed: Use string array instead of MediaTypeOptions
          allowsMultipleSelection: true,
          quality: 0.8,
          selectionLimit: remainingSlots,
        });

        if (!result.canceled && result.assets.length > 0) {
          const sizesValid = await checkFileSizes(result.assets);
          if (!sizesValid) return;

          const validFiles: FileItem[] = [];

          result.assets.forEach((asset) => {
            if (asset.uri && asset.fileSize) {
              const fileName = asset.fileName || `image_${Date.now()}.jpg`;
              if (validateFileSize(asset.fileSize, fileName)) {
                validFiles.push({
                  uri: asset.uri,
                  type: asset.type || "image/jpeg",
                  name: fileName,
                  size: asset.fileSize,
                  id: Math.random().toString(36).substr(2, 9),
                });
              }
            }
          });

          if (validFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
          }
        }
      } else if (previewType === "videos") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["videos"], // Fixed: Use string array instead of MediaTypeOptions
          allowsMultipleSelection: true,
          quality: 0.8,
          selectionLimit: remainingSlots,
        });

        if (!result.canceled && result.assets.length > 0) {
          const sizesValid = await checkFileSizes(result.assets);
          if (!sizesValid) return;

          const validFiles: FileItem[] = [];

          result.assets.forEach((asset) => {
            if (asset.uri && asset.fileSize) {
              const fileName = asset.fileName || `video_${Date.now()}.mp4`;
              if (validateFileSize(asset.fileSize, fileName)) {
                validFiles.push({
                  uri: asset.uri,
                  type: asset.type || "video/mp4",
                  name: fileName,
                  size: asset.fileSize,
                  id: Math.random().toString(36).substr(2, 9),
                });
              }
            }
          });

          if (validFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
          }
        }
      } else if (previewType === "documents") {
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          multiple: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const sizesValid = await checkFileSizes(result.assets);
          if (!sizesValid) return;

          const validFiles: FileItem[] = [];

          result.assets.forEach((asset) => {
            if (asset.uri && asset.size) {
              if (validateFileSize(asset.size, asset.name)) {
                validFiles.push({
                  uri: asset.uri,
                  type: asset.mimeType || "application/octet-stream",
                  name: asset.name,
                  size: asset.size,
                  id: Math.random().toString(36).substr(2, 9),
                });
              }
            }
          });

          if (validFiles.length > 0) {
            setSelectedFiles((prev) =>
              [...prev, ...validFiles].slice(0, MAX_FILES)
            );
          }
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add more files");
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((file) => file.id !== id);
      if (updated.length === 0) {
        handleClose();
      } else if (currentIndex >= updated.length) {
        setCurrentIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const handleSend = async () => {
    if (selectedFiles.length === 0) return;

    const messageId = Math.random() * 1000000000;
    try {
      // Stop any playing video before sending
      setCurrentlyPlaying(null);

      // Prepare FormData here in the component
      const formData = new FormData();

      // Add content/caption
      formData.append("content", caption);

      // Add files to FormData - using the same pattern as working ImageUpload
      selectedFiles.forEach((file, index) => {
        // Format file object exactly like the working ImageUpload component
        const fileObject = {
          uri:
            Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
          type: file.type,
          name: file.name,
        } as any;

        formData.append("attachments", fileObject);

        console.log(`File ${index + 1} prepared for FormData:`, {
          name: file.name,
          type: file.type,
          size: file.size,
          uri: file.uri.substring(0, 50) + "...", // Log partial URI for privacy
        });
      });

      // Create temporary message for UI
      const tempAttachments: Attachment[] = selectedFiles.map((file) => ({
        id: (Math.random() * 1000000000).toString(),
        url: file.uri,
        type: file.type.startsWith("image")
          ? "IMAGE"
          : file.type.startsWith("video")
          ? "VIDEO"
          : "DOCUMENT",
        name: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const newMessage: Message = {
        id: messageId.toString(),
        attachments: tempAttachments,
        chatId: activeChat!.id,
        content: caption,
        sender: currentSender,
        createdAt: new Date().toISOString(),
        readBy: [],
        senderId: currentSender.id,
        updatedAt: new Date().toISOString(),
        isSending: true,
        isError: false,
      };

      dispatch(
        addMessage({ message: newMessage, currentUserId: currentSender.id })
      );
      handleClose();

      // Send FormData directly to mutation
      await sendMessage({
        chatId: activeChat!.id,
        formData: formData, // Pass the prepared FormData
      }).unwrap();
    } catch (error) {
      console.error("Send message error:", error);

      // Update message to show error state
      dispatch(
        updateMessage({
          chatId: activeChat!.id,
          id: messageId.toString(),
          updates: { isSending: false, isError: true },
        })
      );

      Alert.alert("Error", "Failed to send attachments");
    } finally {
      dispatch(
        updateMessage({
          id: messageId.toString(),
          chatId: activeChat!.id,
          updates: { isSending: false },
        })
      );
    }
  };

  const handleClose = () => {
    // Stop any playing video before closing
    setCurrentlyPlaying(null);

    setIsOpen(false);
    setMode("main");
    setPreviewType("");
    setSelectedFiles([]);
    setCaption("");
    setCurrentIndex(0);
    setSizeError("");
  };

  const handleBack = () => {
    if (mode === "preview") {
      // Stop any playing video when going back
      setCurrentlyPlaying(null);

      setMode("main");
      setSelectedFiles([]);
      setCaption("");
      setSizeError("");
    } else {
      handleClose();
    }
  };

  const handleScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index !== currentIndex) {
      // Stop any playing video when switching
      setCurrentlyPlaying(null);
      setCurrentIndex(index);
    }
  };

  const renderMainModal = () => (
    <View
      style={{
        width: screenWidth,
        backgroundColor: "white",
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#1F2937",
          }}
        >
          Add Attachment
        </Text>
        <TouchableOpacity
          onPress={handleClose}
          style={{
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            backgroundColor: "#F3F4F6",
          }}
          activeOpacity={0.7}
        >
          <X size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {sizeError ? (
        <View
          style={{
            backgroundColor: "#FEF2F2",
            borderWidth: 1,
            borderColor: "#FECACA",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#B91C1C", fontSize: 14 }}>{sizeError}</Text>
        </View>
      ) : null}

      {/* Options */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <TouchableOpacity
          style={{
            alignItems: "center",
            flex: 1,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: "#F8FAFC",
            marginHorizontal: 4,
          }}
          activeOpacity={0.7}
          onPress={handlePhotosPress}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#EBF8FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Images size={24} color="#218bff" />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#374151",
              textAlign: "center",
            }}
          >
            Photos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: "center",
            flex: 1,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: "#F8FAFC",
            marginHorizontal: 4,
          }}
          activeOpacity={0.7}
          onPress={handleVideosPress}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#F3F4FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <FileVideo size={24} color="#a475f9" />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#374151",
              textAlign: "center",
            }}
          >
            Videos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: "center",
            flex: 1,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: "#F8FAFC",
            marginHorizontal: 4,
          }}
          activeOpacity={0.7}
          onPress={handleDocumentsPress}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#FDF2F8",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <File size={24} color="#e85aad" />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#374151",
              textAlign: "center",
            }}
          >
            Documents
          </Text>
        </TouchableOpacity>
      </View>

      {/* File size limit info */}
      <Text
        style={{
          fontSize: 12,
          color: "#6B7280",
          textAlign: "center",
          marginTop: 16,
        }}
      >
        Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
      </Text>

      <View style={{ height: 20 }} />
    </View>
  );

  const renderPreviewModal = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "600",
              marginLeft: 12,
              textTransform: "capitalize",
            }}
          >
            {previewType}
          </Text>
        </View>

        <Text
          style={{
            color: "#fff",
            fontSize: 14,
          }}
        >
          {selectedFiles.length} / {MAX_FILES}
        </Text>
      </View>

      {/* Error Message */}
      {sizeError ? (
        <View
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.9)",
            padding: 12,
            marginHorizontal: 16,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14 }}>{sizeError}</Text>
        </View>
      ) : null}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {previewType === "documents" ? (
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              flexGrow: 1,
            }}
            style={{ backgroundColor: "#fff" }}
          >
            {selectedFiles.map((file, index) => (
              <View
                key={file.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F9FAFB",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <View style={{ marginRight: 16 }}>
                  <DocumentIcon filename={file.name} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#1F2937",
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {file.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                    }}
                  >
                    {formatFileSize(file.size)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeFile(file.id)}
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 16,
                    backgroundColor: "#FEE2E2",
                  }}
                  activeOpacity={0.7}
                >
                  <X size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
          >
            {selectedFiles.map((file, index) => (
              <View
                key={file.id}
                style={{
                  width: screenWidth,
                  height: screenHeight * 0.6,
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {previewType === "images" ? (
                  <Image
                    source={{ uri: file.uri }}
                    style={{
                      width: screenWidth - 32,
                      height: "100%",
                      borderRadius: 12,
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <VideoPlayerComponent
                    file={file}
                    isActive={index === currentIndex}
                    onTogglePlay={(playing) => {
                      setCurrentlyPlaying(playing ? file.id : null);
                    }}
                  />
                )}

                <TouchableOpacity
                  onPress={() => removeFile(file.id)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 32,
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 16,
                    backgroundColor: "rgba(0,0,0,0.6)",
                  }}
                  activeOpacity={0.7}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Pagination dots for images/videos */}
        {(previewType === "images" || previewType === "videos") &&
          selectedFiles.length > 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingVertical: 16,
                backgroundColor: "rgba(0,0,0,0.8)",
              }}
            >
              {selectedFiles.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === currentIndex ? "#fff" : "rgba(255,255,255,0.3)",
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          )}
      </View>

      {/* Bottom section with caption and actions */}
      <View
        style={{
          backgroundColor:
            previewType === "documents" ? "#fff" : "rgba(0,0,0,0.8)",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {/* Caption input */}
        <TextInput
          style={{
            backgroundColor:
              previewType === "documents" ? "#F9FAFB" : "rgba(255,255,255,0.1)",
            color: previewType === "documents" ? "#1F2937" : "#fff",
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor:
              previewType === "documents" ? "#E5E7EB" : "rgba(255,255,255,0.2)",
          }}
          placeholder="Add a caption (optional)"
          placeholderTextColor={
            previewType === "documents" ? "#9CA3AF" : "rgba(255,255,255,0.6)"
          }
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={1000}
        />

        {/* Action buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleAddMore}
            disabled={selectedFiles.length >= MAX_FILES}
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              backgroundColor:
                selectedFiles.length >= MAX_FILES
                  ? previewType === "documents"
                    ? "#E5E7EB"
                    : "rgba(255,255,255,0.1)"
                  : previewType === "documents"
                  ? "#EBF8FF"
                  : "rgba(33, 139, 255, 0.2)",
            }}
            activeOpacity={0.7}
          >
            <Plus
              size={24}
              color={
                selectedFiles.length >= MAX_FILES
                  ? "#9CA3AF"
                  : previewType === "documents"
                  ? "#218bff"
                  : "#218bff"
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSend}
            disabled={selectedFiles.length === 0}
            style={{
              backgroundColor:
                selectedFiles.length === 0
                  ? previewType === "documents"
                    ? "#E5E7EB"
                    : "rgba(255,255,255,0.1)"
                  : "#218bff",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 24,
              flexDirection: "row",
              alignItems: "center",
              minWidth: 100,
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Send size={20} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  return (
    <>
      <TouchableOpacity
        className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100"
        activeOpacity={0.7}
        onPress={handleAttachmentPress}
      >
        <Paperclip size={20} color="#218bff" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent={mode === "preview"}
      >
        {mode === "main" ? (
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              justifyContent: "flex-end",
            }}
            activeOpacity={1}
            onPress={handleClose}
          >
            <TouchableOpacity activeOpacity={1}>
              {renderMainModal()}
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          renderPreviewModal()
        )}
      </Modal>
    </>
  );
};
