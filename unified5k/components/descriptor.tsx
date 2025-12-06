/**
 * Evelyn Kwan
 * Boston University
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Descriptor = ({ date, location, time }: { date: string; location: string; time: string }) => (
  <View style={styles.container}>
    <View style={styles.row}>
      <Ionicons name="calendar" size={20} color="#4A90E2" />
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>{date}</Text>
    </View>
    <View style={styles.row}>
      <Ionicons name="location" size={20} color="#4A90E2" />
      <Text style={styles.label}>Location:</Text>
      <Text style={styles.value}>{location}</Text>
    </View>
    <View style={styles.row}>
      <Ionicons name="time" size={20} color="#4A90E2" />
      <Text style={styles.label}>Time:</Text>
      <Text style={styles.value}>{time}</Text>
    </View>
  </View>
);

export default Descriptor;

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderColor: '#4A90E2',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#E8F4FC',
    width: '90%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  value: {
    marginLeft: 4,
    fontSize: 16,
    color: '#333',
  },
});
