import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

export default function UploadProgress({ fileName, progress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <Text style={styles.percent}>{progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: SPACING.sm },
  fileName: { fontSize: FONT_SIZE.sm, color: COLORS.text, marginBottom: SPACING.xs },
  track: { height: 8, borderRadius: RADIUS.pill, backgroundColor: COLORS.background, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.pill },
  percent: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'right' },
});
