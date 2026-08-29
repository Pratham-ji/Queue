import { Expo } from "expo-server-sdk";

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

/**
 * Sends a push notification to an Expo Push Token.
 * This is a non-blocking best-effort dispatch. It swallows errors.
 */
export async function sendPushNotification(
  token: string,
  title: string,
  body: string
): Promise<void> {
  try {
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(token)) {
      console.warn(`[Push] Invalid Expo push token: ${token}`);
      return;
    }

    const message = {
      to: token,
      sound: "default" as const,
      title,
      body,
      data: { type: "queue_alert" },
    };

    // The Expo push service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications.
    // Here we are just sending 1, but we still put it in an array.
    const chunks = expo.chunkPushNotifications([message]);
    
    // Send the chunks to the Expo push notification service
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
        // Note: we don't necessarily care about waiting for receipts for our MVP
      } catch (error) {
        console.error("[Push] Error sending chunk:", error);
      }
    }
  } catch (error) {
    console.error("[Push] Notification dispatch failed (non-fatal):", error);
  }
}
