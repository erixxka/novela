import { Fragment } from 'react';
import { Linking, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { PortableTextBlock, PortableTextSpan } from '../../lib/queries/blog';

const BODY = '#2F4156';
const QUOTE_BORDER = '#567C8D';

function renderSpans(block: PortableTextBlock, baseSize: number, baseColor: string) {
  const markDefs = block.markDefs ?? [];
  return (block.children ?? []).map((span: PortableTextSpan) => {
    const marks = span.marks ?? [];
    const isStrong = marks.includes('strong');
    const isEm = marks.includes('em');
    const linkDef = markDefs.find((d) => marks.includes(d._key) && d._type === 'link');

    const style = {
      fontFamily: isStrong
        ? 'CormorantGaramond_600SemiBold'
        : isEm
          ? 'CormorantGaramond_400Regular_Italic'
          : 'CormorantGaramond_400Regular',
      fontStyle: isEm ? ('italic' as const) : ('normal' as const),
      fontSize: baseSize,
      color: baseColor,
    };

    if (linkDef?.href) {
      const href = linkDef.href;
      return (
        <Text
          key={span._key}
          onPress={() => Linking.openURL(href)}
          style={{ ...style, color: QUOTE_BORDER, textDecorationLine: 'underline' }}
        >
          {span.text}
        </Text>
      );
    }

    return (
      <Text key={span._key} style={style}>
        {span.text}
      </Text>
    );
  });
}

function BlockText({ block }: { block: PortableTextBlock }) {
  const style = block.style ?? 'normal';

  if (style === 'h1' || style === 'h2' || style === 'h3' || style === 'h4') {
    const size = style === 'h1' ? 30 : style === 'h2' ? 26 : style === 'h3' ? 22 : 19;
    return (
      <Text
        style={{
          fontFamily: 'CormorantGaramond_500Medium',
          fontSize: size,
          color: BODY,
          lineHeight: size * 1.2,
          marginTop: 22,
          marginBottom: 8,
        }}
      >
        {renderSpans(block, size, BODY)}
      </Text>
    );
  }

  if (style === 'blockquote') {
    return (
      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: QUOTE_BORDER,
          paddingLeft: 14,
          marginVertical: 14,
        }}
      >
        <Text
          style={{
            fontFamily: 'CormorantGaramond_400Regular_Italic',
            fontStyle: 'italic',
            fontSize: 18,
            color: 'rgba(47,65,86,0.75)',
            lineHeight: 26,
          }}
        >
          {renderSpans(block, 18, 'rgba(47,65,86,0.75)')}
        </Text>
      </View>
    );
  }

  return (
    <Text
      style={{
        fontFamily: 'CormorantGaramond_400Regular',
        fontSize: 18,
        lineHeight: 28,
        color: BODY,
        marginBottom: 14,
      }}
    >
      {renderSpans(block, 18, BODY)}
    </Text>
  );
}

function BulletItem({ block }: { block: PortableTextBlock }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 8, paddingLeft: 4 }}>
      <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 18, color: BODY, lineHeight: 28, marginRight: 8 }}>
        {'•'}
      </Text>
      <Text style={{ flex: 1, fontFamily: 'CormorantGaramond_400Regular', fontSize: 18, color: BODY, lineHeight: 28 }}>
        {renderSpans(block, 18, BODY)}
      </Text>
    </View>
  );
}

export function PortableText({ value }: { value: PortableTextBlock[] | undefined }) {
  if (!value || value.length === 0) return null;

  const out: React.ReactNode[] = [];
  let bulletGroup: PortableTextBlock[] = [];

  const flushBullets = (key: string) => {
    if (bulletGroup.length === 0) return;
    const items = bulletGroup;
    bulletGroup = [];
    out.push(
      <View key={key} style={{ marginVertical: 6 }}>
        {items.map((b) => (
          <BulletItem key={b._key} block={b} />
        ))}
      </View>
    );
  };

  value.forEach((block, i) => {
    if (block._type === 'image' && block.asset?.url) {
      flushBullets(`bl-${i}`);
      out.push(
        <View key={block._key} style={{ marginVertical: 14 }}>
          <Image
            source={{ uri: block.asset.url }}
            style={{ width: '100%', aspectRatio: 3 / 2, borderRadius: 12, backgroundColor: '#EBE3DA' }}
            contentFit="cover"
            transition={200}
          />
          {block.alt ? (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 11,
                color: 'rgba(47,65,86,0.5)',
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              {block.alt}
            </Text>
          ) : null}
        </View>
      );
      return;
    }

    if (block._type === 'block') {
      if (block.listItem === 'bullet') {
        bulletGroup.push(block);
        return;
      }
      flushBullets(`bl-${i}`);
      out.push(<BlockText key={block._key} block={block} />);
    }
  });

  flushBullets('bl-end');

  return <Fragment>{out}</Fragment>;
}
