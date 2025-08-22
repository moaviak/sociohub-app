import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/store";
import { DevicePlatform, notificationApi } from "./api";

// Storage keys constants
const STORAGE_KEYS = {
  DEVICE_ID: "DEVICE_ID",
  PUSH_TOKEN: "PUSH_TOKEN",
  TOKEN_LAST_UPDATED: "TOKEN_LAST_UPDATED",
  PERMISSION_STATUS: "PERMISSION_STATUS",
} as const;

// Token refresh interval (24 hours)
const TOKEN_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

export const initializePushNotifications = async () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Set up notification received listener
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received:", notification);
      // Handle notification received while app is in foreground
    }
  );

  // Set up notification response listener
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
      // Handle notification tap/interaction
    });

  return {
    notificationListener,
    responseListener,
  };
};

export const requestPermissionsAndGetToken = async () => {
  try {
    if (!Device.isDevice) {
      console.log("Push notifications only work on physical devices");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus === Notifications.PermissionStatus.UNDETERMINED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Store permission status
    await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_STATUS, finalStatus);

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      console.log("Permission not granted for push notifications");
      return null;
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    return tokenData.data;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
};

export const getOrCreateDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      // Generate unique device ID
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("Error managing device ID:", error);
    // Fallback device ID
    return `${Platform.OS}_fallback_${Date.now()}`;
  }
};

const getPlatformType = (): DevicePlatform => {
  switch (Platform.OS) {
    case "android":
      return DevicePlatform.ANDROID;
    case "ios":
      return DevicePlatform.IOS;
    case "web":
      return DevicePlatform.WEB;
    case "macos":
    case "windows":
      return DevicePlatform.EXPO;
    default:
      return DevicePlatform.UNKNOWN;
  }
};

export const storePushTokenOnServer = async (token: string) => {
  try {
    const deviceId = await getOrCreateDeviceId();

    const response = await store
      .dispatch(
        notificationApi.endpoints.storePushToken.initiate({
          token,
          deviceId,
          platform: getPlatformType(),
          meta: {
            platform: Platform.OS,
            appVersion: "1.0.0", // Get from app config
            deviceModel: Device.modelName,
            osVersion: Device.osVersion,
            timestamp: new Date().toISOString(),
          },
        })
      )
      .unwrap();

    // Store token and timestamp
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token),
      AsyncStorage.setItem(
        STORAGE_KEYS.TOKEN_LAST_UPDATED,
        Date.now().toString()
      ),
    ]);

    console.log("Push token stored successfully");
    return true;
  } catch (error) {
    console.error("Error storing push token:", error);
    return false;
  }
};

export const setupPushNotifications = async () => {
  try {
    const token = await requestPermissionsAndGetToken();

    if (token) {
      await storePushTokenOnServer(token);
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error setting up push notifications:", error);
    return null;
  }
};

export const getDeviceId = async () => {
  try {
    const deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    return null;
  }
};

export const refreshTokenIfNeeded = async () => {
  try {
    const [storedToken, lastUpdated] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN_LAST_UPDATED),
    ]);

    const now = Date.now();
    const shouldRefresh =
      !lastUpdated || now - parseInt(lastUpdated) > TOKEN_REFRESH_INTERVAL;

    if (shouldRefresh) {
      console.log("Token refresh needed, checking for updates...");
      const currentToken = await requestPermissionsAndGetToken();

      // If token changed or doesn't exist, update server
      if (currentToken && storedToken !== currentToken) {
        console.log("Token changed, updating server...");
        await storePushTokenOnServer(currentToken);
        return { updated: true, token: currentToken };
      }

      // Update timestamp even if token didn't change
      if (currentToken) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.TOKEN_LAST_UPDATED,
          now.toString()
        );
        return { updated: false, token: currentToken };
      }
    }

    return { updated: false, token: storedToken };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return { updated: false, token: null };
  }
};

/**
 * Call this function when user logs out to clean up push notification data
 * This deactivates the token on the server and clears local storage
 */
export const handleLogout = async () => {
  try {
    const [deviceId, pushToken] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID),
      AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
    ]);

    // Clear push notification related data from local storage
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_LAST_UPDATED),
      AsyncStorage.removeItem(STORAGE_KEYS.PERMISSION_STATUS),
      // Keep DEVICE_ID as it should persist across logins for the same device installation
    ]);

    return true;
  } catch (error) {
    console.error("Error during push notification logout cleanup:", error);
    return false;
  }
};

/**
 * Call this function when user logs in to re-setup push notifications
 * This is useful if tokens were deactivated during logout
 */
export const handleLogin = async () => {
  try {
    console.log("Re-setting up push notifications after login...");

    // Check if we still have valid permissions
    const { status } = await Notifications.getPermissionsAsync();

    if (status === Notifications.PermissionStatus.GRANTED) {
      // Re-setup push notifications
      const token = await setupPushNotifications();

      if (token) {
        console.log("Push notifications re-setup successfully after login");
        return token;
      }
    } else {
      console.log("Push notification permissions not granted");
    }

    return null;
  } catch (error) {
    console.error("Error re-setting up push notifications after login:", error);
    return null;
  }
};

/**
 * Get current push notification status for debugging/monitoring
 */
export const getPushNotificationStatus = async () => {
  try {
    const [deviceId, pushToken, lastUpdated, permissionStatus] =
      await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID),
        AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN_LAST_UPDATED),
        AsyncStorage.getItem(STORAGE_KEYS.PERMISSION_STATUS),
      ]);

    const currentPermissions = await Notifications.getPermissionsAsync();

    return {
      deviceId,
      hasToken: !!pushToken,
      tokenLastUpdated: lastUpdated ? new Date(parseInt(lastUpdated)) : null,
      storedPermissionStatus: permissionStatus,
      currentPermissionStatus: currentPermissions.status,
      platform: Platform.OS,
      isPhysicalDevice: Device.isDevice,
      deviceModel: Device.modelName,
      osVersion: Device.osVersion,
    };
  } catch (error) {
    console.error("Error getting push notification status:", error);
    return null;
  }
};

/**
 * Force cleanup of all push notification data (for debugging/reset)
 */
export const resetPushNotifications = async () => {
  try {
    console.log("Resetting all push notification data...");

    // Clear all storage
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID),
      AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_LAST_UPDATED),
      AsyncStorage.removeItem(STORAGE_KEYS.PERMISSION_STATUS),
    ]);

    console.log("Push notification data reset complete");
    return true;
  } catch (error) {
    console.error("Error resetting push notifications:", error);
    return false;
  }
};

// Export storage keys for external use if needed
export { STORAGE_KEYS };
