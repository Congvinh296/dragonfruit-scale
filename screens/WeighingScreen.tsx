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
  const mainScrollRef = useRef<ScrollView>(null);
  
  const exportScrollRef = useRef<ScrollView>(null);
  const rejectScrollRef = useRef<ScrollView>(null);

  const [editingItem, setEditingItem] = useState<WeightItem | null>(null);
  const [editKg, setEditKg] = useState('');
  const [kg, setKg] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType>('EXPORT');

  const [weights, setWeights] = useState<WeightItem[]>([]);

  useEffect(() => {
    if (continueMode && gardenName) loadWeights();
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

    setTimeout(() => {
      if (selectedType === 'EXPORT') {
        exportScrollRef.current?.scrollToEnd({ animated: true });
      } else {
        rejectScrollRef.current?.scrollToEnd({ animated: true });
      }
    }, 120);
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
        { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) },
      ]);
    } catch (e) {
      console.log(e);
    }
  };

  const renderGrid = (
    title: string, 
    items: WeightItem[], 
    color: string, 
    scrollRef: React.RefObject<ScrollView | null>
  ) => {
    const columns: WeightItem[][] = [];
    for (let i = 0; i < items.length; i += 5) {
      columns.push(items.slice(i, i + 5));
    }

    const getColumnTotal = (col: WeightItem[]) => col.reduce((sum, item) => sum + item.kg, 0);

    return (
      <View style={styles.gridContainer}>
        <Text style={[styles.gridTitle, { color }]}>{title}</Text>
        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.gridRow}>
            {columns.map((column, colIndex) => (
              <View key={colIndex} style={styles.gridColumn}>
                <Text style={styles.columnLabel}>C{colIndex + 1}</Text>
                {column.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[styles.gridItem, { borderColor: color }]}
                    onPress={() => { setEditingItem(item); setEditKg(item.kg.toString()); }}
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 80 : 0}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

        <ScrollView 
          ref={mainScrollRef} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerInfo}>
            <Text style={styles.gardenName}>Vườn: {gardenName}</Text>
            <Text style={styles.runningTotal}>{totalAll} kg</Text>
            <Text style={styles.statsCompact}>
              Xuất: {totalExport}kg ({exportCount} ki) • 
              Dạt: {totalReject}kg ({rejectCount} ki)
            </Text>
          </View>

          {exportWeights.length > 0 && renderGrid('HÀNG XUẤT', exportWeights, '#10b981', exportScrollRef)}
          {rejectWeights.length > 0 && renderGrid('HÀNG DẠT', rejectWeights, '#ef4444', rejectScrollRef)}
        </ScrollView>

        {/* Nút Xuất / Dạt - Đã tối ưu mạnh cho Android */}
        <View style={styles.fixedBottom}>
          <View style={styles.typeSelector}>
            <Pressable
              onPress={() => setSelectedType('EXPORT')}
              style={({ pressed }) => [
                styles.typeButton,
                selectedType === 'EXPORT' && styles.typeButtonActiveExport,
                pressed && styles.typeButtonPressed,
              ]}
              android_ripple={{ color: '#ffffff60', borderless: false }}
            >
              <Text style={styles.typeButtonText}>XUẤT</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedType('REJECT')}
              style={({ pressed }) => [
                styles.typeButton,
                selectedType === 'REJECT' && styles.typeButtonActiveReject,
                pressed && styles.typeButtonPressed,
              ]}
              android_ripple={{ color: '#ffffff60', borderless: false }}
            >
              <Text style={styles.typeButtonText}>DẠT</Text>
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={kg}
              onChangeText={setKg}
              keyboardType="numeric"
              placeholder="Nhập kg..."
              style={styles.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addWeight}
            />

            <Pressable
              onPress={addWeight}
              style={styles.addButton}
              android_ripple={{ color: '#ffffff50' }}
            >
              <Text style={styles.addButtonText}>THÊM</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={finishLot}
            style={styles.finishButton}
            android_ripple={{ color: '#ffffff50' }}
          >
            <Text style={styles.finishButtonText}>KẾT THÚC LÔ</Text>
          </Pressable>
        </View>

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
              <Pressable onPress={updateWeight} style={styles.modalSaveButton}>
                <Text style={styles.modalSaveText}>LƯU</Text>
              </Pressable>
              <Pressable onPress={() => { setEditingItem(null); setEditKg(''); }} style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>HỦY</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 12, paddingBottom: 20 },

  headerInfo: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    alignItems: 'center',
  },
  gardenName: { fontSize: 16, fontWeight: '700', color: '#1e3a8a' },
  runningTotal: { fontSize: 26, fontWeight: '700', color: '#10b981', marginVertical: 4 },
  statsCompact: { fontSize: 13.5, color: '#64748b', textAlign: 'center' },

  gridContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
  },
  gridTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  gridRow: { flexDirection: 'row' },
  gridColumn: { marginRight: 7, alignItems: 'center' },
  columnLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  gridItem: {
    width: 50,
    height: 40,
    borderWidth: 2,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  gridItemText: { fontSize: 16.5, fontWeight: '700' },
  gridColumnTotal: {
    width: 50,
    height: 32,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridColumnTotalText: { fontSize: 13.5, fontWeight: '700' },

  fixedBottom: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 10,
  },
  typeSelector: {
  flexDirection: 'row',
  gap: 10,
  marginBottom: 12,
},

typeButton: {
  flex: 1,
  paddingVertical: 15,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',

  backgroundColor: '#e5e7eb',

  elevation: 4,

  borderWidth: 2,
  borderColor: 'transparent',
},

typeButtonActiveExport: {
  backgroundColor: '#10b981',

  borderColor: '#059669',

  elevation: 8,

  shadowColor: '#10b981',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.4,
  shadowRadius: 8,
},

typeButtonActiveReject: {
  backgroundColor: '#ef4444',

  borderColor: '#dc2626',

  elevation: 8,

  shadowColor: '#ef4444',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.4,
  shadowRadius: 8,
},

typeButtonPressed: {
  opacity: 0.85,
  transform: [
    {
      scale: 0.96,
    },
  ],
},

typeButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 19,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    elevation: 5,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  finishButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
  },
  finishButtonText: { color: '#fff', fontSize: 16.5, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, fontSize: 22, textAlign: 'center', marginBottom: 20 },
  modalSaveButton: { backgroundColor: '#10b981', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  modalSaveText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalCancelButton: { padding: 14, alignItems: 'center' },
  modalCancelText: { color: '#64748b', fontSize: 16 },
});