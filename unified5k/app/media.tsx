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

// ===== Types =====
type Article = {
  id: string;
  title: string;
  publication: string;
  imageUrl: string;
  excerpt: string;
  date: string;
};

// ===== Mock Data =====
const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Article Title',
    publication: 'Publication',
    imageUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1400&auto=format&fit=crop',
    excerpt: 'Text',
    date: '2025-08-15T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Unified5K Expands Accessible Course Features',
    publication: "Runner's Daily",
    imageUrl:
      'https://images.unsplash.com/photo-1599050751792-e5fbb2e63fd0?q=80&w=1400&auto=format&fit=crop',
    excerpt:
      'New course updates ensure smoother navigation for wheelchairs and push-rim racers.',
    date: '2025-07-08T09:00:00.000Z',
  },
];

// ===== Sort Options =====
const SORT_OPTIONS = [
  { key: 'recent', label: 'Most recent' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'az', label: 'Title A–Z' },
  { key: 'za', label: 'Title Z–A' },
] as const;

// ===== Segmented Control =====
function Segmented({
  value,
  onChange,
}: {
  value: 'photos' | 'news';
  onChange: (v: 'photos' | 'news') => void;
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
        onPress={() => onChange('photos')}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          backgroundColor: value === 'photos' ? '#E0F7FA' : '#fff',
        }}
      >
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600',
          color: '#000',
        }}>
          Photos
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('news')}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          backgroundColor: value === 'news' ? '#E0F7FA' : '#fff',
        }}
      >
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600',
          color: '#000',
        }}>
          News Articles
        </Text>
      </Pressable>
    </View>
  );
}

// ===== Sort Chip =====
function SortChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.key === value)?.label ?? 'Sort by';

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
            {SORT_OPTIONS.map((opt) => (
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

// ===== Article Card =====
function ArticleCard({ item }: { item: Article }) {
  return (
    <View style={{
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#1BA8D8',
      padding: 20,
      backgroundColor: '#fff',
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 18, color: '#666', marginBottom: 12 }}>
        {item.publication}
      </Text>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={{ width: '100%', height: 176, borderRadius: 8, marginBottom: 12 }}
        resizeMode="cover" 
      />
      <Text style={{ fontSize: 16, color: '#333', marginBottom: 16 }}>
        {item.excerpt}
      </Text>
      <Pressable style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#E0F7FA',
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
          Read More
        </Text>
      </Pressable>
    </View>
  );
}

// ===== Search Bar =====
function SearchBarInline({
  value,
  onChange,
  placeholder = 'Find an Article',
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

// ===== Main Screen =====
export default function MediaNewsScreen() {
    const [mode, setMode] = useState<'photos' | 'news'>('news');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<string>('recent');
  
    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      let list = MOCK_ARTICLES.filter(
        (a) => !q || a.title.toLowerCase().includes(q) || a.publication.toLowerCase().includes(q)
      );
  
      switch (sort) {
        case 'recent':
          return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
        case 'oldest':
          return list.sort((a, b) => +new Date(a.date) - +new Date(b.date));
        case 'az':
          return list.sort((a, b) => a.title.localeCompare(b.title));
        case 'za':
          return list.sort((a, b) => b.title.localeCompare(a.title));
        default:
          return list;
      }
    }, [query, sort]);
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        {/* Header - NO padding wrapper */}
        <Header />
  
        {/* Segmented Control */}
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <Segmented value={mode} onChange={setMode} />
        </View>
  
        {/* Search input */}
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <SearchBarInline value={query} onChange={setQuery} placeholder="Find an Article" />
        </View>
  
        {/* Sort by chip - RIGHT aligned per Figma */}
        <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
          <SortChip value={sort} onChange={setSort} />
        </View>
  
        {/* Article card list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, gap: 16 }}
          renderItem={({ item }) => <ArticleCard item={item} />}
          ListEmptyComponent={() => (
            <View style={{ paddingHorizontal: 24, paddingTop: 40 }}>
              <Text style={{ textAlign: 'center', color: '#999' }}>No articles found.</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }