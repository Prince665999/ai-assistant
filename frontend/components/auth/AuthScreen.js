import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Login from './Login';
import Register from './Register';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/theme';

// A single combined auth surface that toggles between Login and Register
// without a navigation transition. The actual routed screens
// (screens/auth/LoginScreen.js and RegisterScreen.js) are thin wrappers
// used by AuthStack; this component is handy if you ever want the two
// forms on one screen instead.
export default function AuthScreen() {
  const [mode, setMode] = useState('login');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle} />
        </View>
        {mode === 'login' ? (
          <Login onNavigateToRegister={() => setMode('register')} />
        ) : (
          <Register onNavigateToLogin={() => setMode('login')} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  logoCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary },
});
