import type { SnippetKind } from '../../lib/database.types';

export const SNIPPET_KIND: Record<SnippetKind, { label: string; bg: string; color: string }> = {
  note:     { label: 'Note',     bg: 'rgba(47,65,86,0.10)',   color: '#2F4156' },
  quote:    { label: 'Quote',    bg: 'rgba(86,124,141,0.14)', color: '#567C8D' },
  dialogue: { label: 'Dialogue', bg: 'rgba(196,83,74,0.12)',  color: '#C4534A' },
  outline:  { label: 'Outline',  bg: 'rgba(196,153,74,0.14)', color: '#9A6B1A' },
  prompt:   { label: 'Prompt',   bg: 'rgba(86,141,103,0.14)', color: '#3D7A57' },
};
