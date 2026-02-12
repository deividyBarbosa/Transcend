import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfilePhotoProps {
  source: ImageSourcePropType;
  size?: number;
  onEditPress?: () => void;
  editable?: boolean;
}

export function ProfilePhoto({
  source,
  size = 120,
  onEditPress,
  editable = true,
}: ProfilePhotoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={[
          styles.photo,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      {editable && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
  },
  photo: {
    backgroundColor: "#E5E7EB",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D65C73",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
