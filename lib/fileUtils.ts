// utils/fileUtils.ts
import { Alert, Linking } from "react-native";

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Unknown size";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

export const downloadFile = async (url: string, filename: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open file");
    }
  } catch (error) {
    console.error("Download failed:", error);
    Alert.alert("Error", "Failed to download file");
  }
};
