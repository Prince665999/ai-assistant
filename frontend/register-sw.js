// register-sw.js
import { Platform } from "react-native";

export function registerServiceWorker() {
  if (Platform.OS === "web" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("Service worker registered:", reg.scope))
        .catch((err) => console.error("Service worker registration failed:", err));
    });
  }
}