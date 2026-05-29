import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from 'lucide-react-native';
import { uploadCover, getCoverUrl } from '../lib/storage';

export function CoverPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (path: string | null) => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCoverUrl(value).then((url) => {
      if (active) setSignedUrl(url);
    });
    return () => {
      active = false;
    };
  }, [value]);

  const pick = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo permission denied');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    try {
      setUploading(true);
      const path = await uploadCover(result.assets[0].uri);
      onChange(path);
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Pressable
        onPress={pick}
        disabled={uploading}
        className="aspect-[2/3] w-40 rounded-2xl bg-ink-100 dark:bg-ink-700 overflow-hidden items-center justify-center"
      >
        {signedUrl ? (
          <Image source={{ uri: signedUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <View className="items-center">
            <ImagePlus size={28} color="#7c7c89" />
            <Text className="text-xs text-ink-500 dark:text-ink-300 mt-2">Add cover</Text>
          </View>
        )}
        {uploading ? (
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <ActivityIndicator color="white" />
          </View>
        ) : null}
      </Pressable>
      {error ? <Text className="text-red-500 text-xs mt-2">{error}</Text> : null}
      {value ? (
        <Pressable onPress={() => onChange(null)} className="mt-2">
          <Text className="text-xs text-ink-500 dark:text-ink-300">Remove cover</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
