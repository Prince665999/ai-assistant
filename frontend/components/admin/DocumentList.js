import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';
import { formatDate } from '../../utils/formatters';

export default function DocumentList({ documents, onDelete, canDelete = false }) {
  if (!documents?.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No documents uploaded yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={documents}
      keyExtractor={(item) => String(item.id)}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.filename}</Text>
            <Text style={styles.meta}>
              {item.chunk_count ?? 0} chunks · {formatDate(item.created_at)}
            </Text>
            {!!item.error_message && <Text style={styles.errorText}>{item.error_message}</Text>}
          </View>
          <StatusBadge status={item.status} />
          {canDelete && (
            <TouchableOpacity onPress={() => onDelete?.(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW,
    gap: SPACING.sm,
  },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  errorText: { fontSize: FONT_SIZE.xs, color: COLORS.danger, marginTop: 2 },
  deleteButton: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  deleteText: { color: COLORS.danger, fontWeight: '600', fontSize: FONT_SIZE.sm },
  emptyWrap: { padding: SPACING.lg, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
});
