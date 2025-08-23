import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  Camera,
  Images,
  FileVideo,
  X,
  Plus,
  Play,
  Pause,
  File,
} from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Extended file interface for React Native with preview
 */
export interface MediaFileObject {
  uri: string;
  type: string;
  name: string;
  size?: number;
  id: string;
  preview?: string;
}

/**
 * Interface for existing remote media URLs
 */
export interface RemoteMedia {
  url: string;
  name?: string;
  id?: string;
  size?: number;
  type?: "image" | "video" | "document";
}

/**
 * Props for the MediaUploader component
 */
export interface MediaUploaderProps {
  /** Maximum size of each individual file in bytes */
  maxSize?: number;
  /** Maximum total size of all files combined in bytes */
  maxTotalSize?: number;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** Whether to accept video files in addition to images */
  acceptVideos?: boolean;
  /** Whether to accept documents */
  acceptDocuments?: boolean;
  /** Callback when files are selected or removed */
  onFilesChange?: (files: MediaFileObject[]) => void;
  /** Callback for single file selection */
  onFileChange?: (file: MediaFileObject | null) => void;
  /** Whether to show file previews */
  showPreviews?: boolean;
  /** Whether to show remove buttons */
  showRemoveButton?: boolean;
  /** Custom validation function */
  validateFile?: (file: MediaFileObject) => string | null;
  /** Container style class */
  className?: string;
  /** Initial files */
  initialFiles?: MediaFileObject[];
  /** Whether to show file details */
  showFileDetails?: boolean;
  /** Existing remote media */
  existingMedia?: RemoteMedia[];
  /** Callback when remote media is removed */
  onRemoteMediaRemove?: (media: RemoteMedia, index: number) => void;
  /** Image picker quality */
  quality?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Custom placeholder text */
  placeholderText?: string;
}

/**
 * Video component for preview
 */
const VideoPreview: React.FC<{
  file: MediaFileObject;
  isActive: boolean;
  onRemove: () => void;
  showRemoveButton: boolean;
}> = ({ file, isActive, onRemove, showRemoveButton }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(file.uri, (player) => {
    player.loop = false;
    player.muted = true;
  });

  useEffect(() => {
    if (!isActive && isPlaying) {
      player.pause();
      setIsPlaying(false);
    }
  }, [isActive, isPlaying, player]);

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
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error controlling video playback:", error);
    }
  };

  return (
    <View className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 mr-2 mb-2">
      <VideoView
        style={{ width: 96, height: 96 }}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="cover"
        nativeControls={false}
      />

      <TouchableOpacity
        className="absolute inset-0 items-center justify-center bg-black bg-opacity-30"
        onPress={handleTogglePlay}
        activeOpacity={0.7}
      >
        {isPlaying ? (
          <Pause size={24} color="#fff" />
        ) : (
          <Play size={24} color="#fff" />
        )}
      </TouchableOpacity>

      {showRemoveButton && (
        <TouchableOpacity
          onPress={onRemove}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <X size={12} color="#fff" />
        </TouchableOpacity>
      )}

      <View className="absolute bottom-0 right-0 bg-blue-500 rounded-tl px-1">
        <Text className="text-white text-xs">Video</Text>
      </View>
    </View>
  );
};

/**
 * A React Native media upload component with support for images and videos
 */
const MediaUploader: React.FC<MediaUploaderProps> = ({
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxTotalSize,
  maxFiles = 5,
  multiple = false,
  acceptVideos = false,
  acceptDocuments = false,
  onFilesChange,
  onFileChange,
  showPreviews = true,
  showRemoveButton = true,
  validateFile,
  className = "",
  initialFiles = [],
  showFileDetails = true,
  existingMedia = [],
  onRemoteMediaRemove,
  quality = 0.8,
  disabled = false,
  placeholderText,
}) => {
  const [files, setFiles] = useState<MediaFileObject[]>([]);
  const [remoteMedia, setRemoteMedia] = useState<RemoteMedia[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Determine if multiple uploads are enabled
  const isMultipleMode = multiple;
  const effectiveMaxFiles = isMultipleMode ? maxFiles : 1;

  // Initialize with existing media
  useEffect(() => {
    if (existingMedia.length > 0) {
      setRemoteMedia(existingMedia);
    }
  }, [existingMedia]);

  // Initialize with initial files
  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles(initialFiles);
      if (onFilesChange) onFilesChange(initialFiles);
      if (onFileChange && !isMultipleMode) {
        onFileChange(initialFiles[0] || null);
      }
    }
  }, [initialFiles, isMultipleMode, onFileChange, onFilesChange]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get remaining slots
  const getRemainingSlots = useCallback(() => {
    return effectiveMaxFiles - (files.length + remoteMedia.length);
  }, [files.length, effectiveMaxFiles, remoteMedia.length]);

  // Get current total size
  const getCurrentTotalSize = useCallback(() => {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  }, [files]);

  // Create file object
  const createFileObject = (
    asset: ImagePicker.ImagePickerAsset,
    fileType: "image" | "video"
  ): MediaFileObject => {
    const uriParts = asset.uri.split(".");
    const fileExtension =
      uriParts[uriParts.length - 1] || (fileType === "image" ? "jpg" : "mp4");
    const fileName =
      asset.fileName || `${fileType}_${Date.now()}.${fileExtension}`;

    const mimeType =
      fileType === "image"
        ? `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`
        : `video/${fileExtension}`;

    return {
      uri: Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri,
      type: mimeType,
      name: fileName,
      size: asset.fileSize || 0,
      id: Math.random().toString(36).substr(2, 9),
    };
  };

  // Validate files
  const validateFiles = (filesToValidate: MediaFileObject[]): string | null => {
    // Check individual file sizes
    for (const file of filesToValidate) {
      if (file.size && file.size > maxSize) {
        return `File "${file.name}" exceeds maximum size of ${formatFileSize(
          maxSize
        )}`;
      }
    }

    // Check custom validation
    if (validateFile) {
      for (const file of filesToValidate) {
        const error = validateFile(file);
        if (error) return error;
      }
    }

    // Check total size
    if (maxTotalSize && isMultipleMode) {
      const currentSize = getCurrentTotalSize();
      const newFilesSize = filesToValidate.reduce(
        (total, file) => total + (file.size || 0),
        0
      );
      if (currentSize + newFilesSize > maxTotalSize) {
        return `Total file size would exceed limit of ${formatFileSize(
          maxTotalSize
        )}`;
      }
    }

    // Check file count
    const remainingSlots = getRemainingSlots();
    if (filesToValidate.length > remainingSlots) {
      return `Maximum ${effectiveMaxFiles} file${
        effectiveMaxFiles > 1 ? "s" : ""
      } allowed`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelection = async (
    assets: ImagePicker.ImagePickerAsset[],
    fileType: "image" | "video"
  ) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const newFiles = assets.map((asset) => createFileObject(asset, fileType));

      // Validate files
      const validationError = validateFiles(newFiles);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      let updatedFiles: MediaFileObject[];

      if (isMultipleMode) {
        updatedFiles = [...files, ...newFiles];
      } else {
        // In single mode, replace and clear remote media
        if (remoteMedia.length > 0) {
          setRemoteMedia([]);
        }
        updatedFiles = [newFiles[0]];
      }

      setFiles(updatedFiles);

      // Invoke callbacks
      if (onFilesChange) onFilesChange(updatedFiles);
      if (onFileChange && !isMultipleMode) {
        onFileChange(updatedFiles[0] || null);
      }
    } catch (error) {
      setErrorMessage("Error processing files");
    } finally {
      setLoading(false);
    }
  };

  // Show media picker options
  const showMediaPicker = () => {
    if (disabled || loading) return;

    const options: any[] = [
      { text: "Camera", onPress: openCamera },
      { text: "Photo Library", onPress: openPhotoLibrary },
    ];

    if (acceptVideos) {
      options.splice(1, 0, {
        text: "Video Library",
        onPress: openVideoLibrary,
      });
    }

    options.push({ text: "Cancel", style: "cancel" as const });

    Alert.alert("Select Media", "Choose an option to select media", options, {
      cancelable: true,
    });
  };

  // Open camera
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: acceptVideos ? ["images", "videos"] : ["images"],
      quality,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      const fileType = result.assets[0].type?.startsWith("video")
        ? "video"
        : "image";
      handleFileSelection(result.assets, fileType);
    }
  };

  // Open photo library
  const openPhotoLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Media library permission is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality,
      allowsMultipleSelection: isMultipleMode,
      selectionLimit: getRemainingSlots(),
    });

    if (!result.canceled && result.assets.length > 0) {
      handleFileSelection(result.assets, "image");
    }
  };

  // Open video library
  const openVideoLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Media library permission is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality,
      allowsMultipleSelection: isMultipleMode,
      selectionLimit: getRemainingSlots(),
    });

    if (!result.canceled && result.assets.length > 0) {
      handleFileSelection(result.assets, "video");
    }
  };

  // Remove file
  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    setErrorMessage(null);

    if (onFilesChange) onFilesChange(updatedFiles);
    if (onFileChange && !isMultipleMode) {
      onFileChange(updatedFiles[0] || null);
    }
  };

  // Remove remote media
  const removeRemoteMedia = (indexToRemove: number) => {
    const mediaToRemove = remoteMedia[indexToRemove];
    const updatedRemoteMedia = remoteMedia.filter(
      (_, index) => index !== indexToRemove
    );

    setRemoteMedia(updatedRemoteMedia);
    setErrorMessage(null);

    if (onRemoteMediaRemove && mediaToRemove) {
      onRemoteMediaRemove(mediaToRemove, indexToRemove);
    }
  };

  const totalItemsCount = files.length + remoteMedia.length;
  const currentTotalSize = getCurrentTotalSize();

  // Generate placeholder text
  const getPlaceholderText = () => {
    const mediaTypes = acceptVideos ? "photos and videos" : "photos";
    return placeholderText || `Tap to upload ${mediaTypes}`;
  };

  return (
    <View className={className}>
      {/* Upload Area */}
      <TouchableOpacity
        onPress={showMediaPicker}
        disabled={disabled || loading || getRemainingSlots() <= 0}
        className={`border-2 border-dashed rounded-lg p-6 items-center justify-center ${
          errorMessage
            ? "border-red-300 bg-red-50"
            : totalItemsCount > 0
            ? "border-green-500 bg-green-50"
            : "border-gray-300 bg-gray-50"
        } ${disabled ? "opacity-50" : "active:opacity-70"}`}
        style={{ minHeight: 120 }}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : (
          <>
            <View className="w-12 h-12 bg-blue-600 rounded-lg items-center justify-center mb-3">
              {acceptVideos ? (
                <FileVideo size={24} color="#fff" />
              ) : (
                <Images size={24} color="#fff" />
              )}
            </View>

            <Text className="text-lg font-medium text-gray-800 text-center">
              {getPlaceholderText()}
            </Text>

            <Text className="text-sm text-gray-500 text-center mt-1">
              Max size: {formatFileSize(maxSize)}
              {isMultipleMode && ` | Max ${effectiveMaxFiles} files`}
            </Text>

            {acceptVideos && (
              <Text className="text-xs text-gray-400 text-center mt-1">
                Supports images and videos
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {errorMessage && (
        <View className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
          <Text className="text-red-700 text-sm">{errorMessage}</Text>
        </View>
      )}

      {/* File Previews */}
      {showPreviews && totalItemsCount > 0 && (
        <View className="mt-4">
          <ScrollView
            horizontal={isMultipleMode}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className={isMultipleMode ? "flex-row" : "flex-wrap"}>
              {/* Remote media */}
              {remoteMedia.map((media, index) => (
                <View
                  key={`remote-${media.id || index}`}
                  className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 mr-2 mb-2"
                >
                  {media.type === "video" ? (
                    <View className="relative w-full h-full">
                      <Image
                        source={{ uri: media.url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 items-center justify-center bg-black bg-opacity-30">
                        <Play size={24} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: media.url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  )}

                  <View className="absolute bottom-0 right-0 bg-blue-500 rounded-tl px-1">
                    <Text className="text-white text-xs">Existing</Text>
                  </View>

                  {showRemoveButton && (
                    <TouchableOpacity
                      onPress={() => removeRemoteMedia(index)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Local files */}
              {files.map((file, index) => {
                const isImage = file.type.startsWith("image/");
                const isVideo = file.type.startsWith("video/");

                if (isVideo) {
                  return (
                    <VideoPreview
                      key={`file-${file.id}`}
                      file={file}
                      isActive={true}
                      onRemove={() => removeFile(index)}
                      showRemoveButton={showRemoveButton}
                    />
                  );
                }

                return (
                  <View
                    key={`file-${file.id}`}
                    className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 mr-2 mb-2"
                  >
                    {isImage && (
                      <Image
                        source={{ uri: file.uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    )}

                    {showRemoveButton && (
                      <TouchableOpacity
                        onPress={() => removeFile(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                        activeOpacity={0.7}
                      >
                        <X size={12} color="#fff" />
                      </TouchableOpacity>
                    )}

                    {showFileDetails && (
                      <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                        <Text className="text-white text-xs" numberOfLines={1}>
                          {file.name.length > 12
                            ? `${file.name.substring(0, 9)}...`
                            : file.name}
                        </Text>
                        {file.size && (
                          <Text className="text-white text-xs">
                            {formatFileSize(file.size)}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* File count and size info */}
          <View className="mt-3">
            <Text className="text-sm text-gray-600">
              {isMultipleMode
                ? `${totalItemsCount} of ${effectiveMaxFiles} files selected`
                : "File selected"}
            </Text>
            {isMultipleMode && maxTotalSize && (
              <Text className="text-xs text-gray-500">
                Total size: {formatFileSize(currentTotalSize)} /{" "}
                {formatFileSize(maxTotalSize)}
              </Text>
            )}
            {isMultipleMode && getRemainingSlots() > 0 && (
              <Text className="text-xs text-blue-600">
                Tap to add {getRemainingSlots()} more file
                {getRemainingSlots() > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Add more button for multiple mode */}
      {isMultipleMode && totalItemsCount > 0 && getRemainingSlots() > 0 && (
        <TouchableOpacity
          onPress={showMediaPicker}
          disabled={disabled || loading}
          className="mt-3 flex-row items-center justify-center p-3 border border-blue-500 rounded-lg bg-blue-50"
          activeOpacity={0.7}
        >
          <Plus size={20} color="#3B82F6" />
          <Text className="text-blue-600 font-medium ml-2">
            Add More ({getRemainingSlots()} remaining)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MediaUploader;
