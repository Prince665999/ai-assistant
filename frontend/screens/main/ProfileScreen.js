import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import Header from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import * as chatService from '../../services/chat';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';

function confirmAction(title, message, onConfirm) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleClearHistory = () => {
    confirmAction('Clear chat history', 'This cannot be undone. Continue?', async () => {
      setBusy(true);
      try {
        await chatService.clearHistory();
      } catch (error) {
        console.log('[ProfileScreen] clear history failed:', error?.message);
      } finally {
        setBusy(false);
      }
    });
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      const data = await chatService.exportHistory();
      const json = JSON.stringify(data, null, 2);
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chat-history.json';
        link.click();
        URL.revokeObjectURL(url);
      } else {
        console.log('Exported history:', json);
      }
    } catch (error) {
      console.log('[ProfileScreen] export failed:', error?.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    confirmAction('Log out', 'Are you sure you want to log out?', logout);
  };

  return (
    <View style={styles.flex}>
      <Header title="Profile" subtitle="Your account" />

      <View style={styles.card}>
        <Text style={styles.emailLabel}>Signed in as</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {busy && <ActivityIndicator style={{ marginBottom: SPACING.md }} color={COLORS.primary} />}

      <TouchableOpacity style={styles.actionButton} onPress={handleExport} disabled={busy}>
        <Text style={styles.actionText}>Export Chat History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleClearHistory} disabled={busy}>
        <Text style={styles.actionText}>Clear Chat History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOW,
  },
  emailLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: '600' },
  email: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginTop: 4, marginBottom: SPACING.sm },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.background,
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  roleText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.primary },
  actionButton: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW,
  },
  actionText: { fontSize: FONT_SIZE.md, color: COLORS.text, fontWeight: '600' },
  logoutButton: { backgroundColor: COLORS.danger, marginTop: SPACING.md },
  logoutText: { fontSize: FONT_SIZE.md, color: COLORS.onPrimary, fontWeight: '700', textAlign: 'center' },
});
