import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/common/Header';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  function confirmLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  }

  function comingSoon(feature) {
    Alert.alert(feature, 'This will be wired up once chat history is built (Step 16).');
  }

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={[styles.value, styles.roleBadge]}>{user?.role}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => comingSoon('Export chat history')}
        >
          <Text style={styles.secondaryButtonText}>Export chat history</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => comingSoon('Clear chat history')}
        >
          <Text style={styles.secondaryButtonText}>Clear chat history</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  card: {
    backgroundColor: '#ffffff',
    margin: 24,
    borderRadius: 10,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#1f2333',
    marginTop: 4,
  },
  roleBadge: {
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    paddingHorizontal: 24,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#1f2333',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});