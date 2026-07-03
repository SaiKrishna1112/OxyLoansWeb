import { useEffect } from "react";
import { initWebPush } from "../utils/fcmWebPush";

/** Registers web FCM token after login on localhost:3001. */
export default function WebPushBootstrap() {
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const accessToken = sessionStorage.getItem("accessToken");
    if (!userId || !accessToken) return;

    initWebPush(userId, accessToken).then((result) => {
      if (result.ok) {
        console.log("[OxyLoans FCM] ready for user", userId);
      } else {
        console.warn("[OxyLoans FCM] setup skipped:", result.reason);
      }
    });
  }, []);

  return null;
}
