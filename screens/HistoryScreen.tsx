import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { db } from '../database/database';

export default function HistoryScreen({
  navigation,
}: any) {
  const [gardens, setGardens] =
    useState<any[]>([]);

  const loadGardens = async () => {
    try {
      const result =
        await db.getAllAsync(
          `
          SELECT *
          FROM lots
          ORDER BY id DESC
          `
        );

      setGardens(result as any[]);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteGarden = async (
    id: number
  ) => {
    Alert.alert(
      'Xác nhận',
      'Bạn muốn xóa vườn này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync(
                'DELETE FROM lots WHERE id = ?',
                [id]
              );

              await loadGardens();

              Alert.alert(
                'Thông báo',
                'Đã xóa thành công'
              );
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadGardens();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 15,
      }}
    >
      <FlatList
        data={gardens}
        keyExtractor={(item) =>
          item.id.toString()
        }
        ListEmptyComponent={() => (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 30,
              fontSize: 16,
            }}
          >
            Chưa có dữ liệu
          </Text>
        )}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor:
                '#fff',
              padding: 15,
              marginBottom: 12,
              borderRadius: 10,
              elevation: 2,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'LotDetail',
                  {
                    gardenId:
                      item.id,
                  }
                )
              }
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight:
                    'bold',
                  marginBottom: 10,
                }}
              >
                Vườn:{' '}
                {item.gardenName}
              </Text>

              <Text>
                Hàng xuất:{' '}
                {item.totalExport}
                kg
              </Text>

              <Text>
                Hàng dạt:{' '}
                {item.totalReject}
                kg
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  fontWeight:
                    'bold',
                  fontSize: 16,
                }}
              >
                Tổng:{' '}
                {item.totalAll}
                kg
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  color: '#666',
                  fontSize: 12,
                }}
              >
                {item.createdAt}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                deleteGarden(
                  item.id
                )
              }
              style={{
                backgroundColor:
                  '#F44336',
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  textAlign:
                    'center',
                  fontWeight:
                    'bold',
                }}
              >
                XÓA VƯỜN
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}