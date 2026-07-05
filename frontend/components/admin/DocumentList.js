import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';


// documents: [{ id, filename, status, chunk_count, error_message, created_at }]
// onDelete: optional (documentId) => void  -- if provided, shows a delete button per row
export default function DocumentList({ documents, onDelete, emptyText = 'No documents yet.' }) {
  if (!documents || documents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.filename} numberOfLines={1}>{item.filename}</Text>
        <Text style={styles.meta}>
          {item.chunk_count ?? 0} chunks · {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.status === 'failed' && item.error_message ? (
          <Text style={styles.error} numberOfLines={2}>{item.error_message}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <StatusBadge status={item.status} />
        {onDelete ? (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <FlatList
      data={documents}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  filename: {
    fontSize: 14,
    fontWeight: '600',
    color:'#222',
  },
  meta: {
    fontSize: 12,
    color:'#888',
    marginTop: 2,
  },
  error: {
    fontSize: 11,
    color: '#D93025',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  deleteBtn: {
    marginTop: 6,
  },
  deleteText: {
    fontSize: 12,
    color: '#D93025',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEE',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 13,
  },
});
