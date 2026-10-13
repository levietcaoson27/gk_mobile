import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Tour, formatDate, getSeatLabel } from "../utils/tour";

export interface TourItemProps {
  tour: Tour;
  compact?: boolean;
  onPress: (tour: Tour) => void;
  onToggleFavorite: (id: string, next: boolean) => void;
}

const TourItem: React.FC<TourItemProps> = ({
  tour,
  compact = false,
  onPress,
  onToggleFavorite,
}) => {
  const seatLabel = getSeatLabel(tour.seats);
  const isSeatLowOrOut = tour.seats <= 3;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, compact ? styles.compactContainer : styles.normalContainer]}
      onPress={() => onPress(tour)}
    >
      {/* Nút Tim ♥/♡ */}
      <TouchableOpacity
        testID="fav-btn"
        style={[styles.favBtn, compact && styles.compactFavBtn]}
        onPress={() => onToggleFavorite(tour.id, !tour.isFavorite)}
      >
        <Text style={styles.favIcon}>{tour.isFavorite ? "♥" : "♡"}</Text>
      </TouchableOpacity>

      {/* Ảnh */}
      <Image
        source={{ uri: tour.image }}
        style={[styles.image, compact ? styles.compactImage : styles.normalImage]}
        resizeMode="cover"
      />

      {/* Thông tin */}
      <View style={[styles.infoContainer, compact && styles.compactInfoContainer]}>
        <Text
          style={[styles.name, compact && styles.compactName]}
          numberOfLines={compact ? 1 : 2}
        >
          {tour.name}
        </Text>

        {!compact && (
          <>
            <Text style={styles.city}>{tour.city}</Text>
            <Text style={styles.subText}>
              📅 {formatDate(tour.departure)} · {tour.days} ngày
            </Text>
            <Text
              style={[
                styles.seatText,
                isSeatLowOrOut && { color: "red" },
              ]}
            >
              {seatLabel}
            </Text>
          </>
        )}

        <Text style={styles.price}>
          {tour.price.toLocaleString("vi-VN")} ₫
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  // Normal (compact = false) -> Bố cục ngang
  normalContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  normalImage: {
    width: 90,
    height: 90,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  city: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  subText: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  seatText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e53935",
    marginTop: 4,
  },
  favBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  favIcon: {
    fontSize: 22,
    color: "#e53935",
  },

  // Compact (compact = true) -> Thẻ dọc rộng 160
  compactContainer: {
    width: 160,
    marginRight: 10,
    position: "relative",
  },
  compactImage: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  compactFavBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  compactInfoContainer: {
    padding: 8,
    marginLeft: 0,
  },
  compactName: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default React.memo(TourItem);