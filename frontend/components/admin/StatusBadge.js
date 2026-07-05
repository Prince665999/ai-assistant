import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


// status: 'processing' | 'done' | 'failed'
const STATUS_MAP = {
  processing: { label: 'Processing', bg: '#FFF4E0', text: '#C77700' },
  done: { label: 'Done', bg: '#E1F7E8', text: '#1E8E3E' },
  failed: { label: 'Failed', bg: '#FDE8E8', text: '#D93025' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || {
    label: status || 'Unknown',
    bg: '#EEE',
    text: '#666',
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      {status === 'processing' && <View style={[styles.dot, { backgroundColor: config.text }]} />}
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
