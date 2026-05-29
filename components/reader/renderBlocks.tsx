import { Text, View } from 'react-native';

export type Block = { type?: string; content?: Block[]; text?: string; attrs?: { level?: number } };

export type FontFamily = 'cormorant' | 'inter';

export type TypoOpts = { fontSize: number; lineHeight: number; fontFamily?: FontFamily };

function fonts(family: FontFamily | undefined) {
  if (family === 'inter') {
    return {
      body: 'Inter_400Regular',
      heading: 'Inter_600SemiBold',
      quote: 'Inter_400Regular',
      quoteStyle: 'italic' as const,
    };
  }
  return {
    body: 'CormorantGaramond_400Regular',
    heading: 'CormorantGaramond_500Medium',
    quote: 'CormorantGaramond_400Regular_Italic',
    quoteStyle: 'normal' as const,
  };
}

export function renderInline(nodes: Block[] = []): string {
  return nodes
    .map((n) => (n.text ? n.text : n.content ? renderInline(n.content) : ''))
    .join('');
}

export function renderBlock(block: Block, key: number | string, opts: TypoOpts) {
  const { fontSize, lineHeight, fontFamily } = opts;
  const f = fonts(fontFamily);

  if (block.type === 'heading') {
    const level = block.attrs?.level ?? 2;
    const size = level === 1 ? fontSize * 1.6 : level === 2 ? fontSize * 1.3 : fontSize * 1.15;
    return (
      <Text
        key={key}
        style={{
          fontFamily: f.heading,
          fontSize: size,
          color: '#2F4156',
          marginTop: 20,
          marginBottom: 8,
          lineHeight: size * 1.2,
        }}
      >
        {renderInline(block.content)}
      </Text>
    );
  }

  if (block.type === 'blockquote') {
    return (
      <View
        key={key}
        style={{
          borderLeftWidth: 3,
          borderLeftColor: '#567C8D',
          paddingLeft: 14,
          marginVertical: 12,
        }}
      >
        <Text
          style={{
            fontFamily: f.quote,
            fontStyle: f.quoteStyle,
            fontSize: fontSize * 0.95,
            color: 'rgba(47,65,86,0.75)',
            lineHeight: lineHeight * 0.92,
          }}
        >
          {renderInline(block.content)}
        </Text>
      </View>
    );
  }

  if (block.type === 'bulletList' || block.type === 'orderedList') {
    return (
      <View key={key} style={{ marginVertical: 8, marginLeft: 8 }}>
        {(block.content ?? []).map((li, j) => (
          <Text
            key={j}
            style={{
              fontFamily: f.body,
              fontSize,
              color: '#2F4156',
              lineHeight,
            }}
          >
            {block.type === 'orderedList' ? `${j + 1}. ` : '• '}
            {renderInline(li.content)}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <Text
      key={key}
      style={{
        fontFamily: f.body,
        fontSize,
        lineHeight,
        color: '#2F4156',
        marginBottom: fontSize * 0.7,
      }}
    >
      {renderInline(block.content)}
    </Text>
  );
}

export function parseTipTap(json: Record<string, unknown> | null | undefined): Block[] {
  const doc = json as { content?: Block[] } | null | undefined;
  return doc?.content ?? [];
}
