import axios from "axios";
import { BASE_URL, FCM_WEB_CONFIG, FCM_VAPID_KEY } from "../config";

const SW_URL = "/firebase-messaging-sw.js?v=3";

let messagingInstance = null;
let scriptsLoaded = false;
let foregroundHandlerAttached = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureFirebaseLoaded() {
  if (scriptsLoaded && window.firebase?.apps?.length) {
    return window.firebase;
  }
  await loadScript("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
  await loadScript("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(FCM_WEB_CONFIG);
  }
  scriptsLoaded = true;
  return window.firebase;
}

async function registerAndActivateServiceWorker() {
  const registration = await navigator.serviceWorker.register(SW_URL);

  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  await navigator.serviceWorker.ready;

  if (!navigator.serviceWorker.controller && registration.active) {
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 2000);
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      registration.active.postMessage({ type: "SKIP_WAITING" });
    });
  }

  return registration;
}

function showBrowserNotification(title, body, url) {
  if (Notification.permission !== "granted") return;
  const notification = new Notification(title, {
    body,
    icon: "https://oxyloans.com/favicon.ico",
    tag: "oxyloans-foreground-" + Date.now(),
    data: { url: url || "/dashboard" },
  });
  notification.onclick = () => {
    window.focus();
    if (url) window.location.href = url;
    notification.close();
  };
}

function attachOnMessageHandler(messaging) {
  if (foregroundHandlerAttached) return;
  messaging.onMessage((payload) => {
    console.log("[OxyLoans FCM] foreground message", payload);
    const title = payload.notification?.title || payload.data?.title || "OxyLoans";
    const body = payload.notification?.body || payload.data?.body || "";
    const url = payload.data?.redirectUrl || payload.fcmOptions?.link || "/dashboard";
    showBrowserNotification(title, body, url);
  });
  foregroundHandlerAttached = true;
}

export async function attachForegroundMessageHandler() {
  if (!FCM_VAPID_KEY || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return { ok: false, reason: "unsupported" };
  }
  if (Notification.permission !== "granted") {
    return { ok: false, reason: "permission_not_granted" };
  }

  try {
    await registerAndActivateServiceWorker();
    const firebase = await ensureFirebaseLoaded();
    messagingInstance = firebase.messaging();
    attachOnMessageHandler(messagingInstance);
    return { ok: true };
  } catch (error) {
    console.warn("Foreground push handler failed:", error);
    return { ok: false, reason: error.message };
  }
}

export async function initWebPush(userId, accessToken) {
  if (!userId || !FCM_VAPID_KEY) {
    return { ok: false, reason: "missing_user_or_vapid" };
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { ok: false, reason: "unsupported_browser" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, reason: "permission_denied" };
    }

    const firebase = await ensureFirebaseLoaded();
    const registration = await registerAndActivateServiceWorker();

    messagingInstance = firebase.messaging();
    const token = await messagingInstance.getToken({
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return { ok: false, reason: "no_token" };
    }

    console.log("[OxyLoans FCM] web token registered for user", userId, token.substring(0, 20) + "...");

    await axios.post(
      `${BASE_URL}/v1/ai/device/register-token`,
      {
        userId: Number(userId),
        fcmToken: token,
        deviceType: "WEB",
      },
      accessToken ? { headers: { accessToken } } : undefined
    );

    attachOnMessageHandler(messagingInstance);

    return { ok: true, token };
  } catch (error) {
    console.warn("Web push init failed:", error);
    return { ok: false, reason: error.message || "init_failed" };
  }
}

export async function removeWebPushToken(userId, accessToken) {
  if (!userId) return;
  await axios.delete(`${BASE_URL}/v1/ai/device/remove-token`, {
    params: { userId: Number(userId), deviceType: "WEB" },
    headers: accessToken ? { accessToken } : undefined,
  });
}
