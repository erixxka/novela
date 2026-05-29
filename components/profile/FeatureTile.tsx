import { Pressable, Text, View } from 'react-native';

export function FeatureTile({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.75 : 1 })}
    >
      <View
        style={{
          backgroundColor: '#FAF6F2',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(47,65,86,0.10)',
          paddingVertical: 18,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon size={26} color="#2F4156" />
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: 'rgba(47,65,86,0.65)',
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
