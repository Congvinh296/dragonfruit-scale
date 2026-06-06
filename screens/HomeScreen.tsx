import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

export default function HomeScreen({
  navigation,
}: any) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        CÂN HÀNG 
      </Text>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            'CreateLot'
          )
        }
        style={{
          backgroundColor: '#4CAF50',
          padding: 18,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          TẠO VƯỜN MỚI
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            'History'
          )
        }
        style={{
          backgroundColor: '#2196F3',
          padding: 18,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          LỊCH SỬ VƯỜN
        </Text>
      </TouchableOpacity>
    </View>
  );
}