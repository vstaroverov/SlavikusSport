export function getNativePlugin(name) {
  const capacitor = window.Capacitor;
  if (!capacitor || capacitor.getPlatform?.() !== "android") return null;
  if (capacitor.isPluginAvailable && !capacitor.isPluginAvailable(name)) return null;
  return capacitor.Plugins?.[name] || capacitor.registerPlugin?.(name) || null;
}
