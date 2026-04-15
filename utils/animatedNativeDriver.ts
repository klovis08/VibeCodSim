import { Platform } from "react-native";

/** RN Web has no native Animated driver; avoids console warning. */
export const USE_NATIVE_ANIM_DRIVER = Platform.OS !== "web";
