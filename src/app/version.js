export const APP_VERSION = "2.001.1";

export function getAppPlatform(capacitor = globalThis.window?.Capacitor) {
  const platform = capacitor?.getPlatform?.();
  if (platform === "android") return "Android";
  if (platform === "ios") return "iOS";
  if (globalThis.document?.body?.classList?.contains("vk-mini-app")) return "VK Mini App";
  return "Веб-приложение";
}
