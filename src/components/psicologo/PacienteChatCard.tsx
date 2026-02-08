import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

type PacienteChatCardProps = {
  pacientId?: string;
  pacientName: string;
  pacientPhoto: ImageSourcePropType;
  lastMessage: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isActive?: boolean;
  onPress?: () => void;
};

export function PacienteChatCard({
  pacientName,
  pacientPhoto,
  lastMessage,
  lastMessageTime = "",
  unreadCount = 0,
  isActive = false,
  pacientId,
  onPress,
}: PacienteChatCardProps) {
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.6)).current;
  const borderAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.02 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isActive]);

  const formatLastMessage = (
    message: string,
    maxLength: number = 30,
  ): string => {
    if (!message) return "";
    return message.length > maxLength
      ? message.slice(0, maxLength) + "..."
      : message;
  };

  const handleChatPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.02 : 1,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();

    if (onPress) {
      onPress();
    } else if (pacientId) {
      router.push(`/chat/${pacientId}`);
    }
  }, [router, pacientId, onPress, isActive]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(209, 102, 122, 0)", "rgba(209, 102, 122, 0.3)"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={handleChatPress} activeOpacity={0.9}>
        <Animated.View
          style={[
            styles.card,
            isActive && styles.cardActive,
            {
              borderColor: borderColor,
              borderWidth: isActive ? 2 : 0,
            },
          ]}
        >
          <Animated.View
            style={[styles.avatarContainer, { opacity: opacityAnim }]}
          >
            <Image source={pacientPhoto} style={styles.image} />
          </Animated.View>

          <View style={styles.cardTextContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[styles.cardTitle, isActive && styles.cardTitleActive]}
                numberOfLines={1}
              >
                {pacientName}
              </Text>

              {lastMessageTime && (
                <Text
                  style={[styles.timeText, isActive && styles.timeTextActive]}
                >
                  {lastMessageTime}
                </Text>
              )}
            </View>

            <View style={styles.footerRow}>
              <Text
                style={[
                  styles.cardDescription,
                  isActive && styles.cardDescriptionActive,
                ]}
                numberOfLines={1}
              >
                {formatLastMessage(lastMessage)}
              </Text>

              {unreadCount > 0 && (
                <Animated.View
                  style={[
                    styles.unreadBadge,
                    {
                      transform: [
                        {
                          scale: isActive
                            ? scaleAnim.interpolate({
                                inputRange: [0.97, 1.02],
                                outputRange: [0.95, 1.05],
                              })
                            : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.unreadText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </Animated.View>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    shadowColor: "#D1667A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardActive: {
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarContainer: {
    position: "relative",
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#D1667A1A",
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: "#3D2B2ECC",
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  cardTitleActive: {
    color: "#3D2B2E",
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  timeTextActive: {
    color: "#D1667A",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  cardDescriptionActive: {
    color: "#6B7280",
  },
  unreadBadge: {
    backgroundColor: "#D1667A",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
