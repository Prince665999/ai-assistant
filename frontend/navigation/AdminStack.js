import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/ionicons';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UploadScreen from '../screens/admin/UploadScreen';
import DocumentManagementScreen from '../screens/admin/DocumentManagementScreen';
import UserTabs from './UserTabs';


const Tab = createBottomTabNavigator();

const ICONS = {
  'Admin Dashboard': 'shield-checkmark',
  Upload: 'cloud-upload',
  Documents: 'document-text',
  'User View': 'swap-horizontal',
};

// Admins get their own dashboard + document management, plus a "User View"
// tab that drops them into the exact same UserTabs a regular user sees
// (including Profile/Logout), so they never lose access to those actions.
export default function AdminStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#764ba2",
        tabBarInactiveTintColor: "#6b7280",
        tabBarIcon: ({ color, size }) => (
          <Icon name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Admin Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Documents" component={DocumentManagementScreen} />
      <Tab.Screen name="User View" component={UserTabs} />
    </Tab.Navigator>
  );
}
