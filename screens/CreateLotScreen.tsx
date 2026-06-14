import React, { useState } from 'react';
import { db } from '../database/database';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function CreateLotScreen({ navigation }: any) {
  const [gardenName, setGardenName] = useState('');

  const startWeighing = async () => {
    const name = gardenName.trim();
    if (!name) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên vườn');
      return;
    }

    // ... (giữ nguyên logic database)
    const existed = await db.getFirstAsync(
      `SELECT * FROM lots WHERE gardenName = ? AND status = 'OPEN'`,
      [name]
    );

    if (!existed) {
      await db.runAsync(
        `INSERT INTO lots(gardenName, totalExport, totalReject, totalAll, status, createdAt) VALUES(?,?,?,?,?,?)`,
        [name, 0, 0, 0, 'OPEN', new Date().toISOString()]
      );
    }

    navigation.replace('Weighing', { gardenName: name });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

        <View style={styles.header}>
          <Text style={styles.title}>🌱 Tạo Vườn Mới</Text>
          <Text style={styles.subtitle}>Nhập tên vườn để bắt đầu cân hàng</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Tên vườn</Text>
          <TextInput
            placeholder="Ví dụ: Vườn Anh/Chị A "
            value={gardenName}
            onChangeText={setGardenName}
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={startWeighing}
          />

          <Pressable
            onPress={startWeighing}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            android_ripple={{ color: '#ffffff50' }}
          >
            <Text style={styles.buttonText}>BẮT ĐẦU CÂN HÀNG</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: { fontSize: 32, fontWeight: '700', color: '#1e3a8a' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  form: { flex: 1, paddingHorizontal: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 32,
    elevation: 2,
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});