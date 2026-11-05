import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
  StyleProp,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useAppDispatch } from "../../redux/hooks";
import { googleLoginThunk } from "../../redux/slices/authSlice";
import { googleAuthService } from "../../services/googleAuth";

// Official Multi-color Google "G" Vector Icon
export const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  style,
  title = "Continue with Google",
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading || disabled) return;

    if (!googleAuthService.isAvailable()) {
      Alert.alert(
        "Development Build Required",
        "Google Sign-In uses native Google Play Services / iOS frameworks and requires a development build (npx expo run:android or run:ios). It is not available in the standard Expo Go app."
      );
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(googleLoginThunk());

      if (googleLoginThunk.fulfilled.match(resultAction)) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace("/Home" as any);
        }
      } else if (googleLoginThunk.rejected.match(resultAction)) {
        const payload: any = resultAction.payload;
        if (payload?.cancelled) {
          // User closed Google account picker without selecting; silently return
          return;
        }
        const errorMsg =
          (typeof payload === "string" ? payload : payload?.message) ||
          "Google Sign-In failed. Please try again.";
        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (err: any) {
      if (onError) {
        onError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <View style={styles.iconWrapper}>
            <GoogleLogo size={20} />
          </View>
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
    backgroundColor: "#0B1528",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconWrapper: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default GoogleSignInButton;
