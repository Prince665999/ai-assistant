import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


// progress: 0-100, fileName: string
export default function UploadProgress({ fileName, progress }) {
  const clamped = Math.max(0, Math.min(100, progress));
  const isComplete = clamped >= 100;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
        <Text style={styles.percent}>{isComplete ? 'Uploaded' : `${clamped}%`}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: isComplete ? '#1E8E3E' : "#667eea",
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: '#222',
    marginRight: 8,
  },
  percent: {
    fontSize: 12,
    fontWeight: '600',
    color: "#667eea",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
