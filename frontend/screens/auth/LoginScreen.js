import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Login from '../../components/auth/Login';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle} />
        </View>
        <Login onNavigateToRegister={() => navigation.navigate('Register')} />
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
