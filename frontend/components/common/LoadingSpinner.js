import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, FONT_SIZE } from '../../constants/theme';

// A loading state that is ALWAYS visible - plain background color, no
// opacity/visibility tricks. A stuck loading state should look like a
// loading state, never like a blank white screen.
export default function LoadingSpinner({ label = 'Loading…', fullScreen = true }) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    minHeight: 200,
  },
  label: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
});
