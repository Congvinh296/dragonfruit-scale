import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';

import CreateLotScreen from '../screens/CreateLotScreen';

import WeighingScreen from '../screens/WeighingScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LotDetailScreen from '../screens/LotDetailScreen';

const Stack =
  createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="CreateLot"
          component={CreateLotScreen}
        />

        <Stack.Screen
          name="Weighing"
          component={WeighingScreen}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: 'Lịch sử vườn',
          }}
        />

        <Stack.Screen
          name="LotDetail"
          component={LotDetailScreen}
          options={{
            title: 'Chi tiết vườn',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}