import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPassword, passwordsMatch } from '../../utils/validators';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

export default function Register({ onNavigateToLogin }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!isValidPassword(password)) return setError('Password must be at least 6 characters.');
    if (!passwordsMatch(password, confirmPassword)) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      await register(email, password);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Sign up to start chatting with your AI Assistant</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput style={styles.input} placeholder="Re-enter your password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin} style={styles.linkWrap}>
        <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Log in</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.sm, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  error: { color: COLORS.danger, fontSize: FONT_SIZE.sm, marginTop: SPACING.sm },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonText: { color: COLORS.onPrimary, fontWeight: '700', fontSize: FONT_SIZE.md },
  linkWrap: { marginTop: SPACING.lg, alignItems: 'center' },
  link: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});
