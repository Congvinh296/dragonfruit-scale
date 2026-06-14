import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { db } from '../database/database';

type ProductType = 'EXPORT' | 'REJECT';

interface WeightItem {
  id: string;
  kg: number;
  type: ProductType;
  createdAt: number;
}

export default function WeighingScreen({ route, navigation }: any) {
  const gardenName = route?.params?.gardenName || '';
  const continueMode = route?.params?.continueMode || false;

  const inputRef = useRef<TextInput>(null);

  const [editingItem, setEditingItem] = useState<WeightItem | null>(null);
  const [editKg, setEditKg] = useState('');
  const [kg, setKg] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType>('EXPORT');

  const [weights, setWeights] = useState<WeightItem[]>([]);

  useEffect(() => {
    if (continueMode && gardenName) {
      loadWeights();
    }
  }, [continueMode, gardenName]);

  const loadWeights = async () => {
    const rows = await db.getAllAsync(
      `SELECT * FROM weights WHERE gardenName = ? ORDER BY id ASC`,
      [gardenName]
    );

    const result = (rows as any[]).map((item) => ({
      id: item.id.toString(),
      kg: item.kg,
      type: item.type,
      createdAt: new Date(item.createdAt).getTime(),
    }));

    setWeights(result);
  };

  const addWeight = async () => {
    const value = Number(kg);
    if (!value || value <= 0) return;

    const item: WeightItem = {
      id: Date.now().toString(),
      kg: value,
      type: selectedType,
      createdAt: Date.now(),
    };

    setWeights((prev) => [...prev, item]);

    await db.runAsync(
      `INSERT INTO weights(gardenName, kg, type, createdAt) VALUES(?,?,?,?)`,
      [gardenName, value, selectedType, new Date().toISOString()]
    );

    setKg('');
    inputRef.current?.focus();
  };

  const updateWeight = () => {
    if (!editingItem) return;
    const value = Number(editKg);
    if (!value || value <= 0) return;

    setWeights((prev) =>
      prev.map((item) =>
        item.id === editingItem.id ? { ...item, kg: value } : item
      )
    );

    setEditingItem(null);
    setEditKg('');
  };

  const getTypeWeights = (type: ProductType) =>
    weights.filter((w) => w.type === type);

  const exportWeights = getTypeWeights('EXPORT');
  const rejectWeights = getTypeWeights('REJECT');

  const exportCount = exportWeights.length;
  const rejectCount = rejectWeights.length;

  const totalExport = exportWeights.reduce((sum, item) => sum + item.kg, 0);
  const totalReject = rejectWeights.reduce((sum, item) => sum + item.kg, 0);
  const totalAll = totalExport + totalReject;

  const finishLot = async () => {
    try {
      await db.runAsync(
        `UPDATE lots SET totalExport = ?, totalReject = ?, totalAll = ?, status = 'CLOSED' WHERE gardenName = ?`,
        [totalExport, totalReject, totalAll, gardenName]
      );

      Alert.alert('Thông báo', 'Đã lưu vườn thành công', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            }),
        },
      ]);
    } catch (e) {
      console.log(e);
    }
  };

  const renderGrid = (title: string, items: WeightItem[], color: string) => {
    const columns: WeightItem[][] = [];
    for (let i = 0; i < items.length; i += 5) {
      columns.push(items.slice(i, i + 5));
    }

    const getColumnTotal = (column: WeightItem[]) =>
      column.reduce((sum, item) => sum + item.kg, 0);

    return (
      <View style={styles.gridContainer}>
        <Text style={styles.gridTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridRow}>
            {columns.map((column, colIndex) => (
              <View key={colIndex} style={styles.gridColumn}>
                {column.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[styles.gridItem, { borderColor: color }]}
                    onPress={() => {
                      setEditingItem(item);
                      setEditKg(item.kg.toString());
                    }}
                    android_ripple={{ color: '#e5e7eb' }}
                  >
                    <Text style={styles.gridItemText}>{item.kg}</Text>
                  </Pressable>
                ))}

                <View style={[styles.gridColumnTotal, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.gridColumnTotalText, { color }]}>
                    {getColumnTotal(column)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.gardenName}>Vườn: {gardenName}</Text>
          </View>

          {/* Type Selector */}
          <View style={styles.typeSelector}>
            <Pressable
              onPress={() => setSelectedType('EXPORT')}
              style={[
                styles.typeButton,
                selectedType === 'EXPORT' && styles.typeButtonActiveExport,
              ]}
              android_ripple={{ color: '#ffffff40' }}
            >
              <Text style={styles.typeButtonText}>XUẤT</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedType('REJECT')}
              style={[
                styles.typeButton,
                selectedType === 'REJECT' && styles.typeButtonActiveReject,
              ]}
              android_ripple={{ color: '#ffffff40' }}
            >
              <Text style={styles.typeButtonText}>DẠT</Text>
            </Pressable>
          </View>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={kg}
              onChangeText={setKg}
              keyboardType="numeric"
              placeholder="Nhập số kg..."
              style={styles.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addWeight}
            />

            <Pressable
              onPress={addWeight}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              android_ripple={{ color: '#ffffff50' }}
            >
              <Text style={styles.addButtonText}>THÊM CÂN</Text>
            </Pressable>
          </View>

          {/* Finish Button */}
          <Pressable
            onPress={finishLot}
            style={({ pressed }) => [styles.finishButton, pressed && styles.pressed]}
            android_ripple={{ color: '#ffffff50' }}
          >
            <Text style={styles.finishButtonText}>✅ KẾT THÚC LÔ</Text>
          </Pressable>

          {/* Grids */}
          {renderGrid('HÀNG XUẤT', exportWeights, '#10b981')}
          {renderGrid('HÀNG DẠT', rejectWeights, '#ef4444')}

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>TỔNG KẾT</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Xuất:</Text>
              <Text style={styles.summaryValue}>{totalExport} kg ({exportCount} ki)</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dạt:</Text>
              <Text style={styles.summaryValue}>{totalReject} kg ({rejectCount} ki)</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TỔNG CỘNG:</Text>
              <Text style={styles.totalValue}>{totalAll} kg</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Modal */}
      <Modal visible={!!editingItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa số kg</Text>
            <TextInput
              value={editKg}
              onChangeText={setEditKg}
              keyboardType="numeric"
              style={styles.modalInput}
              autoFocus
            />
            <Pressable
              onPress={updateWeight}
              style={({ pressed }) => [styles.modalSaveButton, pressed && styles.pressed]}
              android_ripple={{ color: '#ffffff50' }}
            >
              <Text style={styles.modalSaveText}>LƯU THAY ĐỔI</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setEditingItem(null);
                setEditKg('');
              }}
              style={styles.modalCancelButton}
              android_ripple={{ color: '#e5e7eb' }}
            >
              <Text style={styles.modalCancelText}>HỦY</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, paddingBottom: 100 },

  header: { marginBottom: 24 },
  gardenName: { fontSize: 24, fontWeight: '700', color: '#1e3a8a' },

  typeSelector: { flexDirection: 'row', marginBottom: 24, gap: 12 },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    elevation: 3,
  },
  typeButtonActiveExport: { backgroundColor: '#10b981' },
  typeButtonActiveReject: { backgroundColor: '#ef4444' },
  typeButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  inputContainer: { marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    marginBottom: 12,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  finishButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 6,
  },
  finishButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  gridContainer: { marginBottom: 28 },
  gridTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a8a', marginBottom: 12 },
  gridRow: { flexDirection: 'row' },
  gridColumn: { marginRight: 12 },
  gridItem: {
    width: 68,
    height: 58,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#fff',
    elevation: 2,
  },
  gridItemText: { fontSize: 22, fontWeight: '700' },
  gridColumnTotal: {
    width: 68,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridColumnTotalText: { fontSize: 18, fontWeight: '700' },

  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  summaryTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#1e3a8a' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 16, color: '#64748b' },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  totalRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  totalLabel: { fontSize: 18, fontWeight: '700' },
  totalValue: { fontSize: 24, fontWeight: '700', color: '#10b981' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSaveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
  },
  modalSaveText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalCancelButton: { padding: 16, alignItems: 'center' },
  modalCancelText: { color: '#64748b', fontSize: 16 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});