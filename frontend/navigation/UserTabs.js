import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/ionicons';

import ChatScreen from '../screens/main/ChatScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';


const Tab = createBottomTabNavigator();

const ICONS = {
  Chat: 'chatbubble-ellipses',
  Dashboard: 'stats-chart',
  History: 'time',
  Profile: 'person-circle',
};

export default function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#6b7280",
        tabBarIcon: ({ color, size }) => (
          <Icon name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
