import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { db } from '../database/database';

type ProductType =
  | 'EXPORT'
  | 'REJECT';

interface WeightItem {
  id: string;
  kg: number;
  type: ProductType;
  createdAt: number;
}

export default function WeighingScreen({
  route,
  navigation,
}: any) {
const gardenName =
  route?.params?.gardenName || '';
  const inputRef = useRef<TextInput>(null);

const [editingItem, setEditingItem] =
  useState<WeightItem | null>(null);

const [editKg, setEditKg] =
  useState('');
  const [kg, setKg] = useState('');
  const [selectedType, setSelectedType] =
    useState<ProductType>('EXPORT');

  const [weights, setWeights] = useState<
    WeightItem[]
  >([]);

const [lotStatus, setLotStatus] =
  useState<'OPEN' | 'CLOSED'>(
    'OPEN'
  );

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
    `
    INSERT INTO weights(
      gardenName,
      kg,
      type,
      createdAt
    )
    VALUES(?,?,?,?)
    `,
    [
      gardenName,
      value,
      selectedType,
      new Date().toISOString(),
    ]
  );

  setKg('');

  inputRef.current?.focus();
};

  const undoLast = () => {
    setWeights((prev) => prev.slice(0, -1));
  };
  const updateWeight = () => {
  if (!editingItem) return;

  

  const value = Number(editKg);

  if (!value || value <= 0) return;

  setWeights((prev) =>
    prev.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            kg: value,
          }
        : item
    )
  );

  setEditingItem(null);
  setEditKg('');
};
  const getTypeWeights = (
  type: ProductType
) => {
  return weights.filter(
    (w) => w.type === type
  );
};

  const createColumns = (
    values: number[]
  ) => {
    const columns: number[][] = [];

    for (
      let i = 0;
      i < values.length;
      i += 5
    ) {
      columns.push(
        values.slice(i, i + 5)
      );
    }

    return columns;
  };

  const exportWeights =
    getTypeWeights('EXPORT');


  const rejectWeights =
    getTypeWeights('REJECT');

  const totalExport =
  exportWeights.reduce(
    (sum, item) =>
      sum + item.kg,
    0
  );


const totalReject =
  rejectWeights.reduce(
    (sum, item) =>
      sum + item.kg,
    0
  );

  const totalAll =
    totalExport +
    totalReject;

// XÓA VÀ LƯU LỊCH SỬ CÂN

  const deleteWeight = (
  id: string
  ) => {
    setWeights((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  };
  const finishLot = async () => {
  try {
    const columns = await db.getAllAsync(
  "PRAGMA table_info(lots)"
);

console.log(columns);
    await db.runAsync(
      `
      INSERT INTO lots(
        gardenName,
        totalExport,
        totalReject,
        totalAll,
        status,
        createdAt
      )
      VALUES(?,?,?,?,?,?)
      `,
      [
        gardenName,
        totalExport,
        totalReject,
        totalAll,
        'CLOSED',
        new Date().toISOString(),
      ]
    );

    const rows =
      await db.getAllAsync(
        'SELECT * FROM lots'
      );

    console.log(
      'LOTS:',
      rows
    );

    Alert.alert(
  'Thông báo',
  'Đã lưu vườn thành công',
  [
    {
      text: 'OK',
      onPress: () =>
        navigation.navigate(
          'Home'
        ),
    },
  ]
);
  } catch (e) {
    console.log(
      'LỖI:',
      e
    );
  }
};

  const renderGrid = (
  title: string,
  items: WeightItem[]
) => {
  const columns: WeightItem[][] = [];

  for (
    let i = 0;
    i < items.length;
    i += 5
  ) {
    columns.push(
      items.slice(i, i + 5)
    );
  }

  return (
    <View
      style={{
        marginTop: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 10,
        }}
      >
        {title}
      </Text>

      <ScrollView horizontal>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          {columns.map(
            (column, colIndex) => (
              <View
                key={colIndex}
                style={{
                  marginRight: 15,
                  minWidth: 70,
                }}
              >
                {column.map(
                  (item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        setEditingItem(
                          item
                        );

                        setEditKg(
                          String(
                            item.kg
                          )
                        );
                      }}
                      onLongPress={() => {
                        Alert.alert(
                          'Tùy chọn',
                          `${item.kg} kg`,
                          [
                            {
                              text:
                                'Xóa',
                              style:
                                'destructive',
                              onPress:
                                () =>
                                  deleteWeight(
                                    item.id
                                  ),
                            },
                            {
                              text:
                                'Hủy',
                              style:
                                'cancel',
                            },
                          ]
                        );
                      }}
                    >
                      <View
                        style={{
                          height: 40,
                          justifyContent:
                            'center',
                          alignItems:
                            'center',
                          borderWidth: 1,
                          borderColor:
                            '#ddd',
                        }}
                      >
                        <Text>
                          {
                            item.kg
                          }
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

  return (
    <>
    <ScrollView
      style={{
        flex: 1,
        padding: 15,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
        }}
      >
        Vườn: {gardenName}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setSelectedType(
              'EXPORT'
            )
          }
          style={{
            flex: 1,
            backgroundColor:
              selectedType ===
              'EXPORT'
                ? '#4CAF50'
                : '#BDBDBD',
            padding: 12,
            marginRight: 5,
          }}
        >
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
            }}
          >
            Xuất
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setSelectedType(
              'REJECT'
            )
          }
          style={{
            flex: 1,
            backgroundColor:
              selectedType ===
              'REJECT'
                ? '#F44336'
                : '#BDBDBD',
            padding: 12,
          }}
        >
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
            }}
          >
            Dạt
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        ref={inputRef}
        value={kg}
        onChangeText={setKg}
        keyboardType="numeric"
        placeholder="Nhập số kg"
        style={{
          borderWidth: 1,
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
        }}
      />

      <TouchableOpacity
        onPress={addWeight}
        style={{
          backgroundColor:
            '#2196F3',
          padding: 15,
          marginTop: 15,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          THÊM
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
  onPress={finishLot}
  style={{
    backgroundColor: '#4CAF50',
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
  }}
>
  <Text
    style={{
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    }}
  >
    KẾT THÚC LÔ
  </Text>
</TouchableOpacity>

      {renderGrid(
        'HÀNG XUẤT',
        exportWeights
      )}

      {renderGrid(
        'HÀNG DẠT',
        rejectWeights
      )}

      <View
        style={{
          marginTop: 25,
          padding: 15,
          backgroundColor:
            '#F5F5F5',
          borderRadius: 8,
        }}
      >
        <Text>
          Xuất: {totalExport} kg
        </Text>

        <Text>
          Dạt: {totalReject} kg
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 22,
            fontWeight: 'bold',
          }}
        >
          Tổng: {totalAll} kg
        </Text>
      </View>
    </ScrollView>
    <Modal
  visible={!!editingItem}
  transparent
  animationType="slide"
>
  <View
    style={{
      flex: 1,
      justifyContent:
        'center',
      backgroundColor:
        'rgba(0,0,0,0.4)',
      padding: 20,
    }}
  >
    <View
      style={{
        backgroundColor:
          '#fff',
        padding: 20,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          marginBottom: 15,
        }}
      >
        Sửa số kg
      </Text>

      <TextInput
        value={editKg}
        onChangeText={
          setEditKg
        }
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 15,
        }}
      />

      <TouchableOpacity
        onPress={
          updateWeight
        }
        style={{
          backgroundColor:
            '#4CAF50',
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign:
              'center',
          }}
        >
          Lưu
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          setEditingItem(
            null
          )
        }
        style={{
          marginTop: 10,
          padding: 15,
        }}
      >
        <Text
          style={{
            textAlign:
              'center',
          }}
        >
          Hủy
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </>
  );
}