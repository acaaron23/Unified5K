/**
 * Updated Media Screen with RunSignUp Photo Integration
 * Corrected import paths for your project structure
 */

import React, { useMemo, useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Header from '../components/Header';
import { photoService, type RacePhoto } from '../services/runsignup';

// ===== Types =====
type Article = {
  id: string;
  title: string;
  publication: string;
  imageUrl: string;
  excerpt: string;
  date: string;
};

// Mock articles (keep these for the news tab)
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
          backgroundColor: value === 'photos' ? '#1BA8D8' : '#fff',
        }}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: value === 'photos' ? '#fff' : '#000',
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
          backgroundColor: value === 'news' ? '#1BA8D8' : '#fff',
        }}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: value === 'news' ? '#fff' : '#000',
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
      overflow: 'hidden',
      backgroundColor: '#fff',
      marginBottom: 16,
    }}>
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: '100%', height: 200 }}
        resizeMode="cover"
      />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 12 }}>
          {item.publication}
        </Text>
        <Text style={{ fontSize: 14, color: '#333', marginBottom: 12 }}>
          {item.excerpt}
        </Text>
        {item.date && (
          <Text style={{ fontSize: 12, color: '#999' }}>
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

// ===== Photo Card =====
function PhotoCard({ item }: { item: RacePhoto }) {
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
        source={{ uri: photoService.getPhotoUrl(item, 'large') }} 
        style={{ width: '100%', height: 250 }}
        resizeMode="cover" 
      />
      <View style={{ padding: 16 }}>
        {item.bibs && item.bibs.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {item.bibs.map((bib, idx) => (
              <View 
                key={idx}
                style={{
                  backgroundColor: '#E0F7FA',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  marginRight: 8,
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>Bib #{bib}</Text>
              </View>
            ))}
          </View>
        )}
        {item.caption && (
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            {item.caption}
          </Text>
        )}
        {item.photographer_name && (
          <Text style={{ fontSize: 12, color: '#999' }}>
            Photo by {item.photographer_name}
          </Text>
        )}
        <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
          {photoService.formatPhotoDate(item)}
        </Text>
      </View>
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
  const [mode, setMode] = useState<'photos' | 'news'>('photos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<string>('recent');
  
  // Photo state
  const [photos, setPhotos] = useState<RacePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch photos from races
   * Currently showing mock data for testing
   */
  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Show mock photos for testing (no API required)
      const mockPhotos: RacePhoto[] = [
        {
          photo_id: 1,
          album_id: 1,
          race_event_days_id: 1,
          uploaded_ts: Date.now() / 1000,
          uploaded_filename: 'boston_marathon_finish.jpg',
          original: { image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', width: 1200, height: 800 },
          thumbnail: { image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400', width: 400, height: 267 },
          large: { image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800', width: 800, height: 533 },
          caption: 'Boston Marathon finish line celebration',
          bibs: [1234],
          photographer_name: 'RunPhoto Pro',
        },
        {
          photo_id: 2,
          album_id: 2,
          race_event_days_id: 2,
          uploaded_ts: Date.now() / 1000 - 86400,
          uploaded_filename: 'nyc_5k_runners.jpg',
          original: { image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200', width: 1200, height: 800 },
          thumbnail: { image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400', width: 400, height: 267 },
          large: { image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800', width: 800, height: 533 },
          caption: 'NYC 5K runners in Central Park',
          bibs: [5678, 5679],
          photographer_name: 'Race Photos Inc',
        },
        {
          photo_id: 3,
          album_id: 3,
          race_event_days_id: 3,
          uploaded_ts: Date.now() / 1000 - 172800,
          uploaded_filename: 'chicago_unity_run.jpg',
          original: { image_url: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=1200', width: 1200, height: 800 },
          thumbnail: { image_url: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=400', width: 400, height: 267 },
          large: { image_url: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800', width: 800, height: 533 },
          caption: 'Chicago Run for Unity participants',
          bibs: [9012],
        },
      ];

      setPhotos(mockPhotos);
    } catch (err: any) {
      console.error('Error loading photos:', err);
      setError(err.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  // Load photos when mode changes to photos
  useEffect(() => {
    if (mode === 'photos') {
      fetchPhotos();
    }
  }, [mode]);

  // Filtered articles (existing logic)
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

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    let list = [...photos];

    // Apply sorting
    switch (sort) {
      case 'recent':
        return list.sort((a, b) => b.uploaded_ts - a.uploaded_ts);
      case 'oldest':
        return list.sort((a, b) => a.uploaded_ts - b.uploaded_ts);
      default:
        return list;
    }
  }, [photos, sort]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      {/* Header */}
      <Header />

      {/* Segmented Control */}
      <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
        <Segmented value={mode} onChange={setMode} />
      </View>

      {/* Search input */}
      <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
        <SearchBarInline 
          value={query} 
          onChange={setQuery} 
          placeholder={mode === 'photos' ? 'Search Photos' : 'Find an Article'} 
        />
      </View>

      {/* Sort by chip */}
      <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
        <SortChip value={sort} onChange={setSort} />
      </View>

      {/* Content based on mode */}
      {mode === 'news' ? (
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
      ) : (
        <>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#1BA8D8" />
              <Text style={{ marginTop: 16, color: '#666' }}>Loading photos...</Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ color: '#DC2626', marginBottom: 16 }}>{error}</Text>
              <TouchableOpacity
                onPress={fetchPhotos}
                style={{
                  backgroundColor: '#1BA8D8',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredPhotos}
              keyExtractor={(item) => item.photo_id.toString()}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 }}
              renderItem={({ item }) => <PhotoCard item={item} />}
              ListEmptyComponent={() => (
                <View style={{ paddingTop: 40 }}>
                  <Text style={{ textAlign: 'center', color: '#999' }}>No photos available yet.</Text>
                  <Text style={{ textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12 }}>
                    Photos will appear here after races are completed.
                  </Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}