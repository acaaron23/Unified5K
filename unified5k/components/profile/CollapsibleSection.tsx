/**
 * COLLAPSIBLE SECTION - Expandable content container
 * Used in profile page to show/hide race registrations
 * Toggles between open and closed states with animated chevron
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icons

// Component props
interface Props {
  title: string; // Section header text
  children?: React.ReactNode; // Content to display when expanded
}

const CollapsibleSection: React.FC<Props> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false); // Track expand/collapse state

  return (
    <View style={styles.wrapper}>
      {/* Clickable header to toggle section */}
      <TouchableOpacity
        style={[styles.headerBox, isOpen ? styles.openHeader : styles.closedHeader]}
        onPress={() => setIsOpen(!isOpen)} // Toggle open/closed
      >
        <Text style={styles.title}>{title}</Text>
        {/* Chevron icon changes based on state */}
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#00AEEF"
        />
      </TouchableOpacity>

      {/* Show content only when expanded */}
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  headerBox: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closedHeader: {
    backgroundColor: 'white',
    borderColor: '#00AEEF',
  },
  openHeader: {
    backgroundColor: '#DDF4FC',
    borderColor: '#DDF4FC',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
});

export default CollapsibleSection;
