import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Film, Plus } from 'lucide-react-native';
import type { MediaMovieRow } from '../lib/database.types';
import {
  useMovies,
  useCreateMovie,
  useUpdateMovie,
  useDeleteMovie,
  type MovieInput,
} from '../lib/queries/media';
import { MediaCard } from '../components/media/MediaCard';
import { MovieEditor } from '../components/media/MovieEditor';

function buildSubtitle(row: MediaMovieRow): string {
  return [row.director, row.year, row.genre].filter(Boolean).join(' · ');
}

export default function MoviesScreen() {
  const router = useRouter();
  const { data: movies, isLoading } = useMovies();
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const deleteMovie = useDeleteMovie();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<MediaMovieRow | null>(null);

  const openNew = () => {
    setEditing(null);
    setEditorVisible(true);
  };
  const openEdit = (row: MediaMovieRow) => {
    setEditing(row);
    setEditorVisible(true);
  };
  const close = () => setEditorVisible(false);

  const handleSave = async (values: MovieInput) => {
    if (editing) {
      await updateMovie.mutateAsync({ id: editing.id, ...values });
    } else {
      await createMovie.mutateAsync(values);
    }
    close();
  };
  const handleDelete = async () => {
    if (!editing) return;
    await deleteMovie.mutateAsync(editing.id);
    close();
  };

  const saving = createMovie.isPending || updateMovie.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      {/* Header bar: back + brand */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 4,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 10,
                letterSpacing: 2.2,
                textTransform: 'uppercase',
                color: 'rgba(47,65,86,0.42)',
              }}
            >
              Films you love
            </Text>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_500Medium',
                fontSize: 30,
                color: '#2F4156',
                lineHeight: 34,
                marginTop: 2,
              }}
            >
              Movies
            </Text>
          </View>
          <Pressable
            onPress={openNew}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#2F4156',
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 9,
              }}
            >
              <Plus size={13} color="#F5EFEB" />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  color: '#F5EFEB',
                }}
              >
                Add movie
              </Text>
            </View>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color="#567C8D" />
          </View>
        ) : !movies || movies.length === 0 ? (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 24,
              backgroundColor: '#FAF6F2',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(47,65,86,0.10)',
              padding: 24,
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Film size={28} color="rgba(47,65,86,0.30)" />
            <Text
              style={{
                fontFamily: 'CormorantGaramond_400Regular',
                fontSize: 20,
                color: '#2F4156',
                textAlign: 'center',
              }}
            >
              No movies yet
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: 'rgba(47,65,86,0.55)',
                textAlign: 'center',
                lineHeight: 19,
              }}
            >
              Add your first movie — keep its poster, year, and a line that stays with you.
            </Text>
            <Pressable
              onPress={openNew}
              style={{
                marginTop: 4,
                backgroundColor: '#2F4156',
                borderRadius: 999,
                paddingHorizontal: 18,
                paddingVertical: 11,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: '#F5EFEB',
                }}
              >
                Add your first movie
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              backgroundColor: '#FAF6F2',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(47,65,86,0.10)',
              overflow: 'hidden',
            }}
          >
            {movies.map((movie, i) => (
              <View
                key={movie.id}
                style={{
                  borderBottomWidth: i < movies.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(47,65,86,0.10)',
                }}
              >
                <MediaCard
                  imagePath={movie.image_path}
                  title={movie.title}
                  subtitle={buildSubtitle(movie)}
                  snippet={movie.snippet}
                  kind="movie"
                  onPress={() => openEdit(movie)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <MovieEditor
        visible={editorVisible}
        initial={editing}
        onClose={close}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        saving={saving}
      />
    </SafeAreaView>
  );
}
