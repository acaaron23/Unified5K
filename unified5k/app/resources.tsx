/**
 * RESOURCES PAGE - Training plans and blog posts
 * Shows fitness resources for runners
 * Tabbed interface with training plans and blog articles
 */

import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  FlatList,
  Modal,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; // Icons
import Header from '@/components/Header'; // App header

// Blog post data structure
type Blog = {
  id: string;
  title: string;
  imageUrl: string;
  date?: string;
};

// Training plan data structure
type TrainingPlan = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

// Mock blog posts for display
const BLOGS: Blog[] = [
  {
    id: 'b1',
    title: '5 Tips for First-Time 5K Runners',
    date: '2025-01-15',
    imageUrl:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b2',
    title: 'The Importance of Inclusive Running Communities',
    date: '2025-01-10',
    imageUrl:
      'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b3',
    title: 'Adaptive Running: Breaking Down Barriers',
    date: '2025-01-05',
    imageUrl:
      'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b4',
    title: 'Nutrition Guide for Race Day Success',
    date: '2024-12-28',
    imageUrl:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b5',
    title: 'Building Mental Resilience as a Runner',
    date: '2024-12-20',
    imageUrl:
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b6',
    title: 'How to Choose the Right Running Shoes',
    date: '2024-12-15',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b7',
    title: 'Cross-Training Exercises for Runners',
    date: '2024-12-10',
    imageUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b8',
    title: 'Running with a Disability: Success Stories',
    date: '2024-12-05',
    imageUrl:
      'https://images.unsplash.com/photo-1520975922203-b6b7d3f6a3f0?q=80&w=1400&auto=format&fit=crop',
  },
];

// Mock training plans for display
const TRAINING_PLANS: TrainingPlan[] = [
  {
    id: 't1',
    title: 'Couch to 5K - Beginner Program',
    description: '8-week program designed for absolute beginners to complete their first 5K',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 't2',
    title: 'Advanced Marathon Training',
    description: '16-week intensive program for experienced runners targeting sub-4 hour marathons',
    imageUrl:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 't3',
    title: 'Adaptive Running Guide',
    description: 'Comprehensive training plan for runners with physical disabilities',
    imageUrl:
      'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 't4',
    title: '10K Speed Improvement Plan',
    description: '10-week program focused on increasing your 10K pace and endurance',
    imageUrl:
      'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 't5',
    title: 'Half Marathon Preparation',
    description: '12-week training schedule to prepare for your first half marathon',
    imageUrl:
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1400&auto=format&fit=crop',
  },
];

// Available sort options
const SORT_OPTS = [
  { key: 'recent', label: 'Most recent' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'az', label: 'Title A–Z' },
  { key: 'za', label: 'Title Z–A' },
] as const;

// Tab selector component - Training Plans or Blog Posts
function SegmentedResources({
  active,
  onChange
}: {
  active: 'training' | 'blogs';
  onChange: (tab: 'training' | 'blogs') => void;
}) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      borderRadius: 24, 
      borderWidth: 2, 
      borderColor: '#1BA8D8',
      overflow: 'hidden',
      backgroundColor: '#fff',
    }}>
      <Pressable
        onPress={() => onChange('training')}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          backgroundColor: active === 'training' ? '#1BA8D8' : '#fff',
        }}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: active === 'training' ? '#fff' : '#000',
        }}>
          Training Plans
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('blogs')}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          backgroundColor: active === 'blogs' ? '#1BA8D8' : '#fff',
        }}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: active === 'blogs' ? '#fff' : '#000',
        }}>
          Blog Posts
        </Text>
      </Pressable>
    </View>
  );
}

// Search input component
function SearchBarInline({
  value,
  onChange,
  placeholder = 'Find a Blog',
}: {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#1BA8D8',
      backgroundColor: '#fff',
    }}>
      <TextInput
        style={{ flex: 1, fontSize: 16 }}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
      <Ionicons name="search" size={20} color="#666" />
    </View>
  );
}

// Sort dropdown with modal picker
function SortChip({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTS.find((o) => o.key === value)?.label ?? 'Sort by';
  return (
    <View style={{ alignSelf: 'flex-end' }}>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: '#1BA8D8',
        }}
      >
        <Text style={{ fontSize: 14, color: '#1BA8D8' }}>{current}</Text>
        <Feather name="chevron-down" size={16} color="#1BA8D8" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setOpen(false)}>
          <View style={{
            position: 'absolute',
            left: 24,
            right: 24,
            top: 160,
            borderRadius: 16,
            backgroundColor: '#fff',
            padding: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}>
            {SORT_OPTS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 16 }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// Individual blog post card
function BlogRow({ item }: { item: Blog }) {
  return (
    <View style={{
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#1BA8D8',
      overflow: 'hidden',
      backgroundColor: '#fff',
      marginBottom: 16,
    }}>
      <Image
        source={{ uri: item.imageUrl }}
        style={{
          width: '100%',
          height: 220,
        }}
        resizeMode="cover"
      />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          {item.title}
        </Text>
        {item.date && (
          <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            {new Date(item.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        )}
      </View>
    </View>
  );
}

// Individual training plan card
function TrainingPlanRow({ item }: { item: TrainingPlan }) {
  return (
    <View style={{
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#1BA8D8',
      overflow: 'hidden',
      backgroundColor: '#fff',
      marginBottom: 16,
    }}>
      <Image
        source={{ uri: item.imageUrl }}
        style={{
          width: '100%',
          height: 220,
        }}
        resizeMode="cover"
      />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
          {item.description}
        </Text>
      </View>
    </View>
  );
}

// Main resources screen component
export default function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState<'training' | 'blogs'>('training'); // Active tab
  const [query, setQuery] = useState(''); // Search query
  const [sort, setSort] = useState<string>('recent'); // Sort order
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh state

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate refresh
    setRefreshing(false);
  };

  // Filter and sort blog posts
  const blogList = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = BLOGS.filter((b) => !q || b.title.toLowerCase().includes(q));
    switch (sort) {
      case 'az':
        return data.sort((a, b) => a.title.localeCompare(b.title));
      case 'za':
        return data.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return data;
    }
  }, [query, sort]);

  // Filter and sort training plans
  const trainingList = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = TRAINING_PLANS.filter((t) => !q || t.title.toLowerCase().includes(q));
    switch (sort) {
      case 'az':
        return data.sort((a, b) => a.title.localeCompare(b.title));
      case 'za':
        return data.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return data;
    }
  }, [query, sort]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      {/* Header */}
      <Header />

      {/* Segmented Control */}
      <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
        <SegmentedResources active={activeTab} onChange={setActiveTab} />
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
        <SearchBarInline 
          value={query} 
          onChange={setQuery} 
          placeholder={activeTab === 'blogs' ? 'Find a Blog' : 'Find a Training Plan'} 
        />
      </View>

      {/* Sort - Right aligned */}
      <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
        <SortChip value={sort} onChange={setSort} />
      </View>

      {/* Content List - conditional based on active tab */}
      {activeTab === 'blogs' ? (
        <FlatList
          data={blogList}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 }}
          renderItem={({ item }) => <BlogRow item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1BA8D8']}
              tintColor="#1BA8D8"
            />
          }
          ListEmptyComponent={() => (
            <View style={{ paddingTop: 40 }}>
              <Text style={{ textAlign: 'center', color: '#999' }}>No blogs found.</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={trainingList}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 }}
          renderItem={({ item }) => <TrainingPlanRow item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1BA8D8']}
              tintColor="#1BA8D8"
            />
          }
          ListEmptyComponent={() => (
            <View style={{ paddingTop: 40 }}>
              <Text style={{ textAlign: 'center', color: '#999' }}>No training plans found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}