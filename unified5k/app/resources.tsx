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
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Header from '@/components/Header';

// ---------- Types ----------
type Blog = {
  id: string;
  title: string;
  imageUrl: string;
  date?: string;
};

type TrainingPlan = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

const BLOGS: Blog[] = [
  {
    id: 'b1',
    title: 'Blog Post Title',
    imageUrl:
      'https://images.unsplash.com/photo-1520975922203-b6b7d3f6a3f0?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 'b2',
    title: 'Blog Post Title',
    imageUrl:
      'https://images.unsplash.com/photo-1520975922203-b6b7d3f6a3f0?q=80&w=1400&auto=format&fit=crop',
  },
];

const TRAINING_PLANS: TrainingPlan[] = [
  {
    id: 't1',
    title: 'Training Plan Title',
    description: 'Description of the training plan',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1400&auto=format&fit=crop',
  },
  {
    id: 't2',
    title: 'Advanced Running Program',
    description: '12-week intensive training for competitive runners',
    imageUrl:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop',
  },
];

const SORT_OPTS = [
  { key: 'recent', label: 'Most recent' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'az', label: 'Title A–Z' },
  { key: 'za', label: 'Title Z–A' },
] as const;

// ---------- Segmented Control ----------
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
          backgroundColor: active === 'training' ? '#E0F7FA' : '#fff',
        }}
      >
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600',
          color: '#000',
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
          backgroundColor: active === 'blogs' ? '#E0F7FA' : '#fff',
        }}
      >
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600',
          color: '#000',
        }}>
          Blog Posts
        </Text>
      </Pressable>
    </View>
  );
}

// ---------- Search Bar ----------
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

// ---------- Sort Chip ----------
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

// ---------- Blog Row ----------
function BlogRow({ item }: { item: Blog }) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>
        {item.title}
      </Text>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={{ 
          width: '100%', 
          height: 220, 
          borderRadius: 12,
          marginBottom: 16,
        }} 
        resizeMode="cover" 
      />
      {/* Divider line */}
      <View style={{ 
        height: 1, 
        backgroundColor: '#1BA8D8', 
        opacity: 0.3,
      }} />
    </View>
  );
}

// ---------- Training Plan Row ----------
function TrainingPlanRow({ item }: { item: TrainingPlan }) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 12 }}>
        {item.description}
      </Text>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={{ 
          width: '100%', 
          height: 220, 
          borderRadius: 12,
          marginBottom: 16,
        }} 
        resizeMode="cover" 
      />
      {/* Divider line */}
      <View style={{ 
        height: 1, 
        backgroundColor: '#1BA8D8', 
        opacity: 0.3,
      }} />
    </View>
  );
}

// ---------- Main Screen ----------
export default function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState<'training' | 'blogs'>('training');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<string>('recent');

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