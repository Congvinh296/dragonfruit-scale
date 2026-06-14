import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { db } from '../database/database';

export default function HistoryScreen({ navigation }: any) {
  const [gardens, setGardens] = useState<any[]>([]);

  const loadGardens = async () => {
    try {
      const result = await db.getAllAsync(`
        SELECT * FROM lots ORDER BY id DESC
      `);
      setGardens(result as any[]);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteGarden = async (id: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa vườn này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const lot = gardens.find((x) => x.id === id);
            if (lot) {
              await db.runAsync(`DELETE FROM weights WHERE gardenName = ?`, [lot.gardenName]);
              await db.runAsync(`DELETE FROM lots WHERE id = ?`, [id]);
            }

            await loadGardens();
            Alert.alert('Thành công', 'Đã xóa vườn thành công');
          } catch (error) {
            console.log('Lỗi xóa:', error);
            Alert.alert('Lỗi', 'Không thể xóa dữ liệu');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    loadGardens();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <Text style={styles.title}>📋 Lịch Sử Vườn</Text>
        <Text style={styles.subtitle}>Tất cả các lô đã tạo</Text>
      </View>

      <FlatList
        data={gardens}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có dữ liệu vườn nào</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              onPress={() => navigation.navigate('LotDetail', { gardenId: item.id })}
              style={styles.cardContent}
              android_ripple={{ color: '#e5e7eb' }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.gardenName}>🌱 {item.gardenName}</Text>
                <Text
                  style={[
                    styles.status,
                    item.status === 'OPEN' ? styles.statusOpen : styles.statusClosed,
                  ]}
                >
                  {item.status === 'OPEN' ? '🟢 Đang cân' : '🔴 Đã kết thúc'}
                </Text>
              </View>

              <View style={styles.stats}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Hàng xuất</Text>
                  <Text style={styles.statValue}>{item.totalExport} kg</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Hàng dạt</Text>
                  <Text style={styles.statValue}>{item.totalReject} kg</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TỔNG</Text>
                  <Text style={styles.totalValue}>{item.totalAll} kg</Text>
                </View>
              </View>

              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </Pressable>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <Pressable
                onPress={() =>
                  navigation.navigate('Weighing', {
                    gardenName: item.gardenName,
                    continueMode: true,
                  })
                }
                style={styles.continueButton}
                android_ripple={{ color: '#ffffff50' }}
              >
                <Text style={styles.continueButtonText}>TIẾP TỤC CÂN</Text>
              </Pressable>

              <Pressable
                onPress={() => deleteGarden(item.id)}
                style={styles.deleteButton}
                android_ripple={{ color: '#ffffff50' }}
              >
                <Text style={styles.deleteButtonText}>XÓA VƯỜN</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  gardenName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1e3a8a',
    flex: 1,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '700',
  },
  statusOpen: {
    backgroundColor: '#d1fae5',
    color: '#10b981',
  },
  statusClosed: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  stats: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  date: {
    color: '#94a3b8',
    fontSize: 13,
  },
  buttonGroup: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 4,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 4,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 17,
    color: '#94a3b8',
  },
});