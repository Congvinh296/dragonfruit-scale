import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
} from 'react-native';

import { db } from '../database/database';

export default function LotDetailScreen({
  route,
}: any) {
  const { gardenId } =
    route.params;

  const [lot, setLot] =
    useState<any>(null);

  const [weights, setWeights] =
    useState<any[]>([]);

  const loadLot = async () => {
    const lotResult =
      await db.getFirstAsync(
        `
        SELECT *
        FROM lots
        WHERE id = ?
        `,
        [gardenId]
      );

    setLot(lotResult);

    if (lotResult) {
      const weightResult =
        await db.getAllAsync(
          `
          SELECT *
          FROM weights
          WHERE lotCode = ?
          ORDER BY id ASC
          `,
          [
            (lotResult as any)
              .gardenName,
          ]
        );
      setWeights(
        weightResult as any[]
      );
    }
  };

  useEffect(() => {
    loadLot();
  }, []);

  const createColumns = (
    values: number[]
  ) => {
    const columns: number[][] =
      [];

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

  const renderGrid = (
    title: string,
    values: number[]
  ) => {
    const columns =
      createColumns(values);

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
              (
                column,
                index
              ) => (
                <View
                  key={index}
                  style={{
                    marginRight: 15,
                  }}
                >
                  {column.map(
                    (
                      value,
                      rowIndex
                    ) => (
                      <View
                        key={
                          rowIndex
                        }
                        style={{
                          width: 70,
                          height: 40,
                          borderWidth: 1,
                          borderColor:
                            '#ddd',
                          justifyContent:
                            'center',
                          alignItems:
                            'center',
                        }}
                      >
                        <Text>
                          {value}
                        </Text>
                      </View>
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

  if (!lot) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            'center',
          alignItems:
            'center',
        }}
      >
        <Text>
          Đang tải...
        </Text>
      </View>
    );
  }

  const exportWeights =
    weights
      .filter(
        (x) =>
          x.type ===
          'EXPORT'
      )
      .map((x) => x.kg);

  const rejectWeights =
    weights
      .filter(
        (x) =>
          x.type ===
          'REJECT'
      )
      .map((x) => x.kg);

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        {lot.gardenName}
      </Text>

      <Text
        style={{
          marginBottom: 10,
        }}
      >
        Ngày tạo:{' '}
        {lot.createdAt}
      </Text>

      <View
        style={{
          backgroundColor:
            '#fff',
          padding: 20,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            marginBottom: 10,
          }}
        >
          Hàng xuất:{' '}
          {lot.totalExport}
          kg
        </Text>

        <Text
          style={{
            fontSize: 18,
            marginBottom: 10,
          }}
        >
          Hàng dạt:{' '}
          {lot.totalReject}
          kg
        </Text>

        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginTop: 15,
          }}
        >
          Tổng:{' '}
          {lot.totalAll}
          kg
        </Text>
      </View>
    </ScrollView>
  );
}