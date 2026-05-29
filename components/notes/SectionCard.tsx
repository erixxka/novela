import { ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

export function SectionCard({
  title,
  eyebrow,
  count,
  rightSlot,
  children,
}: {
  title: string;
  eyebrow: string;
  count?: number;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
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
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
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
              marginBottom: 2,
            }}
          >
            {eyebrow}
          </Text>
          <Text
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 20,
              color: '#2F4156',
              lineHeight: 24,
            }}
          >
            {title}
            {count != null ? (
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_400Regular',
                  color: 'rgba(47,65,86,0.42)',
                }}
              >
                {' · '}
                {count}
              </Text>
            ) : null}
          </Text>
        </View>
        {rightSlot}
        {open ? (
          <ChevronUp size={16} color="rgba(47,65,86,0.42)" />
        ) : (
          <ChevronDown size={16} color="rgba(47,65,86,0.42)" />
        )}
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 14 }}>{children}</View>
      ) : null}
    </View>
  );
}
