import { Text, View } from 'react-native';

export function ComingSoon({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  message: string;
}) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: '#FAF6F2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(47,65,86,0.10)',
        padding: 28,
        alignItems: 'center',
        gap: 14,
      }}
    >
      <Icon size={34} color="rgba(47,65,86,0.30)" />
      <Text
        style={{
          fontFamily: 'CormorantGaramond_500Medium',
          fontSize: 24,
          color: '#2F4156',
          textAlign: 'center',
        }}
      >
        Coming soon
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: 'rgba(47,65,86,0.55)',
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
