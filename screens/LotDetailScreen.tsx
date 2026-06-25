import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { db } from '../database/database';

export default function LotDetailScreen({ route }: any) {
  const { gardenId } = route.params;

  const [lot, setLot] = useState<any>(null);
  const [weights, setWeights] = useState<any[]>([]);
  const [exportCount, setExportCount] = useState(0);
  const [rejectCount, setRejectCount] = useState(0);

  const [lossPerTon, setLossPerTon] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [lossKg, setLossKg] = useState(0);
  const [remainKg, setRemainKg] = useState(0);
  const [totalMoney, setTotalMoney] = useState(0);

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

    // Load dữ liệu thanh toán lần cuối
    const payment = await db.getFirstAsync(
      `SELECT * FROM lot_payments WHERE lotId = ? ORDER BY id DESC LIMIT 1`,
      [gardenId]
    );

    if (payment) {
      setLossPerTon(String((payment as any).lossPerTon || ''));
      setPricePerKg(String((payment as any).pricePerKg || ''));
      setLossKg((payment as any).lossKg || 0);
      setRemainKg((payment as any).remainKg || 0);
      setTotalMoney((payment as any).totalMoney || 0);
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

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handlePriceChange = (text: string) => {
    setPricePerKg(formatCurrency(text));
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
        <Text style={[styles.gridTitle, { color }]}>{title}</Text>
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

  const calculateMoney = () => {
    const totalKg = Number(lot.totalAll);
    const hao = Number(lossPerTon);
    const price = Number(pricePerKg.replace(/\./g, ''));

    if (!hao || !price) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ dữ liệu');
      return;
    }

    const haoKg = (totalKg / 1000) * hao;
    const remain = totalKg - haoKg;
    const money = remain * price;

    setLossKg(haoKg);
    setRemainKg(remain);
    setTotalMoney(money);
  };

  const savePayment = async () => {
    try {
      await db.runAsync(
        `INSERT INTO lot_payments(lotId, lossPerTon, lossKg, remainKg, pricePerKg, totalMoney, createdAt)
         VALUES(?,?,?,?,?,?,?)`,
        [lot.id, Number(lossPerTon), lossKg, remainKg, Number(pricePerKg.replace(/\./g, '')), totalMoney, new Date().toISOString()]
      );

      Alert.alert('Thành công', 'Đã lưu thông tin thanh toán');
      loadLot(); // Load lại dữ liệu sau khi lưu
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu');
    }
  };

  if (!lot) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  const exportWeights = weights.filter(x => x.type === 'EXPORT').map(x => x.kg);
  const rejectWeights = weights.filter(x => x.type === 'REJECT').map(x => x.kg);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Chi Tiết Vườn</Text>
          <Text style={styles.gardenName}>{lot.gardenName}</Text>
          <Text style={styles.dateText}>Ngày tạo: {formatDate(lot.createdAt)}</Text>
        </View>

        <View style={styles.moneyCard}>
          <Text style={styles.moneyTitle}>TÍNH TIỀN</Text>

          <View style={styles.totalSummary}>
            <Text style={styles.totalLabelSmall}>Tổng Hàng Xuất:</Text>
            <Text style={styles.totalValueSmall}>{lot.totalExport} kg ({exportCount} ki)</Text>

            <Text style={styles.totalLabelSmall}>Tổng Hàng Dạt:</Text>
            <Text style={styles.totalValueSmall}>{lot.totalReject} kg ({rejectCount} ki)</Text>

            <Text style={styles.totalLabelSmall}>Tổng Cộng:</Text>
            <Text style={styles.totalAllValue}>{lot.totalAll} kg</Text>
          </View>

          <Text style={styles.label}>Khối hao (kg/1000kg)</Text>
          <TextInput
            value={lossPerTon}
            onChangeText={setLossPerTon}
            keyboardType="numeric"
            placeholder="Ví dụ: 80"
            style={styles.input}
          />

          <Text style={styles.label}>Giá bán (đ/kg)</Text>
          <TextInput
            value={pricePerKg}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
            placeholder="15.000"
            style={styles.input}
          />

          <TouchableOpacity style={styles.calcBtn} onPress={calculateMoney}>
            <Text style={styles.calcBtnText}>TÍNH TOÁN</Text>
          </TouchableOpacity>

          {totalMoney > 0 && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>Khối hao: {lossKg.toFixed(2)} kg</Text>
              <Text style={styles.resultText}>Còn lại: {remainKg.toFixed(2)} kg</Text>
              <Text style={styles.moneyResult}>
                {totalMoney.toLocaleString('vi-VN')} vnd
              </Text>

              <TouchableOpacity style={styles.saveBtn} onPress={savePayment}>
                <Text style={styles.saveBtnText}>💾 LƯU KẾT QUẢ</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {exportWeights.length > 0 && renderGrid('HÀNG XUẤT', exportWeights, '#10b981')}
        {rejectWeights.length > 0 && renderGrid('HÀNG DẠT', rejectWeights, '#ef4444')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 30 },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1e3a8a', marginBottom: 8 },
  gardenName: { fontSize: 24, fontWeight: '700', color: '#1e3a8a' },
  dateText: { fontSize: 15, color: '#64748b', marginTop: 6 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { fontSize: 18, color: '#64748b' },

  moneyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    marginBottom: 20,
  },
  moneyTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e3a8a', 
    marginBottom: 16, 
    textAlign: 'center' 
  },

  totalSummary: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  totalLabelSmall: { 
    fontSize: 15, 
    color: '#64748b', 
    marginTop: 6 
  },
  totalValueSmall: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e3a8a' 
  },
  totalAllValue: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#10b981', 
    marginTop: 6 
  },

  label: { 
    fontSize: 15, 
    color: '#374151', 
    marginTop: 12, 
    marginBottom: 6 
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    backgroundColor: '#fff',
    elevation: 1,
  },
  calcBtn: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    elevation: 4,
  },
  calcBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resultBox: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  resultText: { fontSize: 15.5, color: '#374151', marginVertical: 4 },
  moneyResult: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#10b981', 
    marginVertical: 12, 
    textAlign: 'center' 
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  gridContainer: { marginHorizontal: 16, marginBottom: 24 },
  gridTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  gridRow: { flexDirection: 'row' },
  gridColumn: { marginRight: 12 },
  gridItem: {
    width: 68,
    height: 48,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#fff',
    elevation: 2,
  },
  gridItemText: { fontSize: 18, fontWeight: '700' },
});