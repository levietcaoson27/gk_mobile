import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SectionList,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import TourItem from "./components/TourItem";
import { Tour, groupByCity } from "./utils/tour";

const API_URL = "https://6abb5ce6b2118ed7abb85a9a.mockapi.io/Tours";

export default function App() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Hàm gọi API GET dữ liệu
  const fetchTours = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTours(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách tour từ server!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTours(true);
  };

  // Xử lý sự kiện nhấn vào Tour để hiển thị Alert
  const handleTourPress = (tour: Tour) => {
    Alert.alert(
      "Chi tiết Tour",
      `Tên: ${tour.name}\nNgày khởi hành: ${tour.departure}\nSố ngày: ${tour.days}\nGiá: ${tour.price.toLocaleString("vi-VN")} ₫`
    );
  };

  // Xử lý cập nhật yêu thích (PUT) với Cập nhật lạc quan (Optimistic Update)
  const handleToggleFavorite = async (id: string, next: boolean) => {
    // Lưu lại trạng thái cũ để phòng khi lỗi mạng thì hoàn tác
    const previousTours = [...tours];

    // Cập nhật lạc quan trên state ngay lập tức
    setTours((prev) =>
      prev.map((tour) => (tour.id === id ? { ...tour, isFavorite: next } : tour))
    );

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorite: next }),
      });

      if (!response.ok) {
        throw new Error("Cập nhật thất bại trên server");
      }
    } catch (error) {
      // Hoàn tác về trạng thái cũ nếu lỗi
      setTours(previousTours);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại!");
    }
  };

  // Lọc tour theo từ khóa tìm kiếm (dùng useMemo, không phân biệt hoa thường, trim)
  const filteredTours = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return tours;
    return tours.filter((tour) => tour.name.toLowerCase().includes(keyword));
  }, [tours, searchQuery]);

  // Gom nhóm danh sách chính theo thành phố sau khi lọc
  const sectionData = useMemo(() => {
    return groupByCity(filteredTours);
  }, [filteredTours]);

  // Danh sách các tour yêu thích cho Header ngang (không bị ảnh hưởng bởi ô tìm kiếm)
  const favoriteTours = useMemo(() => {
    return tours.filter((tour) => tour.isFavorite);
  }, [tours]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tour Việt</Text>
          <Text style={styles.studentInfo}>23637311 - Le Viet Cao Son</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tour theo tên..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* SectionList chính */}
        <SectionList
          sections={sectionData}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <TourItem
              tour={item}
              compact={false}
              onPress={handleTourPress}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.favoriteSection}>
              <Text style={styles.favoriteTitle}>
                Tour yêu thích ({favoriteTours.length})
              </Text>
              {favoriteTours.length === 0 ? (
                <Text style={styles.emptyFavoriteText}>Chưa có tour yêu thích</Text>
              ) : (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={favoriteTours}
                  keyExtractor={(item) => `fav-${item.id}`}
                  renderItem={({ item }) => (
                    <TourItem
                      tour={item}
                      compact={true}
                      onPress={handleTourPress}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy tour phù hợp</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  studentInfo: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  searchInput: {
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: "#e3f2fd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginVertical: 8,
  },
  sectionHeaderText: {
    fontWeight: "bold",
    color: "#0d47a1",
    fontSize: 14,
  },
  favoriteSection: {
    marginVertical: 10,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  emptyFavoriteText: {
    fontSize: 13,
    color: "#777",
    fontStyle: "italic",
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
  },
});