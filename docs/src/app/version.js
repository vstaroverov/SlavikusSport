export const APP_VERSION = "2.001.1";

export function getAppPlatform(capacitor = globalThis.window?.Capacitor) {
  const platform = capacitor?.getPlatform?.();
  if (platform === "android") return "Android";
  if (platform === "ios") return "iOS";
  return "Веб-приложение";
}
