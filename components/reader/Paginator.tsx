import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { renderBlock, type Block, type FontFamily } from './renderBlocks';

export function Paginator({
  blocks,
  fontSize,
  lineHeight,
  fontFamily,
  viewportHeight,
  contentWidth,
  onPaginated,
}: {
  blocks: Block[];
  fontSize: number;
  lineHeight: number;
  fontFamily?: FontFamily;
  viewportHeight: number;
  contentWidth: number;
  onPaginated: (pages: Block[][]) => void;
}) {
  const heightsRef = useRef<number[]>([]);
  const [measuredCount, setMeasuredCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    heightsRef.current = [];
    setMeasuredCount(0);
    doneRef.current = false;
  }, [blocks, fontSize, lineHeight, fontFamily, viewportHeight, contentWidth]);

  useEffect(() => {
    if (doneRef.current) return;
    if (blocks.length === 0) {
      doneRef.current = true;
      onPaginated([]);
      return;
    }
    if (measuredCount < blocks.length) return;

    const pages: Block[][] = [];
    let current: Block[] = [];
    let used = 0;
    blocks.forEach((b, i) => {
      const h = heightsRef.current[i] ?? 0;
      if (used + h > viewportHeight && current.length > 0) {
        pages.push(current);
        current = [];
        used = 0;
      }
      current.push(b);
      used += h;
    });
    if (current.length) pages.push(current);

    doneRef.current = true;
    onPaginated(pages);
  }, [measuredCount, blocks, viewportHeight, onPaginated]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: contentWidth,
        opacity: 0,
      }}
    >
      {blocks.map((b, i) => (
        <View
          key={i}
          onLayout={(e) => {
            heightsRef.current[i] = e.nativeEvent.layout.height;
            setMeasuredCount((c) => c + 1);
          }}
        >
          {renderBlock(b, i, { fontSize, lineHeight, fontFamily })}
        </View>
      ))}
    </View>
  );
}
