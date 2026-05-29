import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X } from 'lucide-react-native';
import { uploadMediaImage, getMediaImageUrl } from '../../lib/storage';

export function MediaImagePicker({
  value,
  onChange,
  kind,
  aspect = [1, 1],
}: {
  value: string | null;
  onChange: (path: string | null) => void;
  kind: 'songs' | 'movies';
  aspect?: [number, number];
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMediaImageUrl(value).then((url) => {
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
      aspect,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    try {
      setUploading(true);
      const path = await uploadMediaImage(result.assets[0].uri, kind);
      onChange(path);
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const confirmClear = () => {
    Alert.alert('Remove image?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
    ]);
  };

  const width = 120;
  const ratio = aspect[1] / aspect[0];
  const height = Math.round(width * ratio);

  return (
    <View>
      <Pressable
        onPress={pick}
        onLongPress={value ? confirmClear : undefined}
        disabled={uploading}
        style={{
          width,
          height,
          borderRadius: 12,
          backgroundColor: 'rgba(86,124,141,0.10)',
          borderWidth: 1,
          borderColor: 'rgba(47,65,86,0.14)',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {signedUrl ? (
          <Image source={{ uri: signedUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <View style={{ alignItems: 'center', gap: 6 }}>
            <ImagePlus size={22} color="rgba(47,65,86,0.45)" />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 10,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'rgba(47,65,86,0.55)',
              }}
            >
              Add image
            </Text>
          </View>
        )}
        {uploading ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(47,65,86,0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color="#F5EFEB" />
          </View>
        ) : null}
      </Pressable>
      {value ? (
        <Pressable
          onPress={confirmClear}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 6,
          }}
        >
          <X size={11} color="rgba(47,65,86,0.55)" />
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: 'rgba(47,65,86,0.55)',
            }}
          >
            Remove
          </Text>
        </Pressable>
      ) : null}
      {error ? (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: '#C4534A',
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
