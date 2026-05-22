import { Platform, type ViewStyle } from "react-native";

/**
 * Returns iOS shadow properties on iOS, elevation on Android.
 * Never mix both — shadow* props are silently ignored on Android,
 * elevation is silently ignored on iOS.
 */
export function platformShadow(
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): ViewStyle {
  if (Platform.OS === "android") {
    return { elevation };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}
