import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UploadScreen from '../screens/admin/UploadScreen';
import DocumentManagementScreen from '../screens/admin/DocumentManagementScreen';
import UserTabs from './UserTabs';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const ICONS = {
  Overview: '📈',
  Upload: '⬆️',
  Documents: '📁',
  'User View': '👤',
};

// Admin gets its own tab navigator, with a "User View" tab that drops
// them into the regular user experience (nested navigator) so they can
// switch back and forth without logging out.
export default function AdminStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Overview" component={AdminDashboardScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Documents" component={DocumentManagementScreen} />
      <Tab.Screen name="User View" component={UserTabs} />
    </Tab.Navigator>
  );
}
