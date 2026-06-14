import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { db } from '../database/database';

export default function LotDetailScreen({ route }: any) {
  const { gardenId } = route.params;

  const [lot, setLot] = useState<any>(null);
  const [weights, setWeights] = useState<any[]>([]);
  const [exportCount, setExportCount] = useState(0);
  const [rejectCount, setRejectCount] = useState(0);

  const loadLot = async () => {
    const lotResult = await db.getFirstAsync(
      `SELECT * FROM lots WHERE id = ?`,
      [gardenId]
    );

    setLot(lotResult);

    if (lotResult) {
      const weightResult = await db.getAllAsync(
        `SELECT * FROM weights WHERE gardenName = ? ORDER BY id ASC`,
        [(lotResult as any).gardenName]
      );

      setWeights(weightResult as any[]);

      const exportRows = (weightResult as any[]).filter(item => item.type === 'EXPORT');
      const rejectRows = (weightResult as any[]).filter(item => item.type === 'REJECT');

      setExportCount(exportRows.length);
      setRejectCount(rejectRows.length);
    }
  };

  useEffect(() => {
    loadLot();
  }, []);

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

  const createColumns = (values: number[]) => {
    const columns: number[][] = [];
    for (let i = 0; i < values.length; i += 5) {
      columns.push(values.slice(i, i + 5));
    }
    return columns;
  };

  const renderGrid = (title: string, values: number[], color: string) => {
    const columns = createColumns(values);

    return (
      <View style={styles.gridContainer}>
        <Text style={styles.gridTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridRow}>
            {columns.map((column, colIndex) => (
              <View key={colIndex} style={styles.gridColumn}>
                {column.map((value, rowIndex) => (
                  <View key={rowIndex} style={[styles.gridItem, { borderColor: color }]}>
                    <Text style={styles.gridItemText}>{value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (!lot) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  const exportWeights = weights
    .filter(x => x.type === 'EXPORT')
    .map(x => x.kg);

  const rejectWeights = weights
    .filter(x => x.type === 'REJECT')
    .map(x => x.kg);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🌱 Chi Tiết Vườn</Text>
          <Text style={styles.gardenName}>{lot.gardenName}</Text>
          <Text style={styles.dateText}>Ngày tạo: {formatDate(lot.createdAt)}</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>TỔNG KẾT</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hàng xuất</Text>
            <Text style={styles.summaryValue}>
              {lot.totalExport} kg ({exportCount} ki)
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hàng dạt</Text>
            <Text style={styles.summaryValue}>
              {lot.totalReject} kg ({rejectCount} ki)
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
            <Text style={styles.totalValue}>{lot.totalAll} kg</Text>
          </View>
        </View>

        {/* Export Grid */}
        {exportWeights.length > 0 && renderGrid('HÀNG XUẤT', exportWeights, '#10b981')}

        {/* Reject Grid */}
        {rejectWeights.length > 0 && renderGrid('HÀNG DẠT', rejectWeights, '#ef4444')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  gardenName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  dateText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#10b981',
  },

  // Grid Styles
  gridContainer: {
    marginHorizontal: 16,
    marginBottom: 28,
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridColumn: {
    marginRight: 14,
  },
  gridItem: {
    width: 72,
    height: 52,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  gridItemText: {
    fontSize: 20,
    fontWeight: '700',
  },
});