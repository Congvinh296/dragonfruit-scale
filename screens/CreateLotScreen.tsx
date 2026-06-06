import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
} from 'react-native';

export default function CreateLotScreen({
  navigation,
}: any) {
  const [gardenName, setGardenName] =
    useState('');

  const startWeighing = () => {
    const name =
      gardenName.trim();

    if (!name) {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập tên vườn'
      );
      return;
    }

    navigation.navigate(
      'Weighing',
      {
        gardenName: name,
      }
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <TextInput
        placeholder="Nhập tên vườn"
        value={gardenName}
        onChangeText={
          setGardenName
        }
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <Button
        title="Bắt đầu cân"
        onPress={startWeighing}
      />
    </View>
  );
}