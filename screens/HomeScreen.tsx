import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <Text style={styles.title}>CÂN HÀNG</Text>
        <Text style={styles.subtitle}>Quản lý vườn trồng</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigation.navigate('CreateLot')}
          style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
          android_ripple={{ color: '#ffffff50' }}
        >
          <Text style={styles.buttonText}>🌱 TẠO VƯỜN MỚI</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('History')}
          style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.pressed]}
          android_ripple={{ color: '#ffffff50' }}
        >
          <Text style={styles.buttonText}>📋 LỊCH SỬ VƯỜN</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1e3a8a',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 6,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    gap: 18,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  primaryButton: { backgroundColor: '#10b981' },
  secondaryButton: { backgroundColor: '#3b82f6' },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});