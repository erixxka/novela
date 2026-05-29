export type StoryStatus = 'draft' | 'on-going' | 'hiatus' | 'completed' | 'published';

export interface StoryRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  status: StoryStatus;
  genre: string | null;
  mature: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChapterRow {
  id: string;
  story_id: string;
  title: string;
  content: Record<string, unknown>;
  content_text: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TagRow {
  id: string;
  user_id: string;
  name: string;
}

export interface StoryTagRow {
  story_id: string;
  tag_id: string;
}

export interface ReadingProgressRow {
  user_id: string;
  story_id: string;
  chapter_id: string;
  scroll_position: number;
  page_index: number;
  updated_at: string;
}

export interface BookmarkRow {
  id: string;
  user_id: string;
  chapter_id: string;
  note: string | null;
  scroll_position: number;
  page_index: number | null;
  created_at: string;
}

export interface ReadingListRow {
  user_id: string;
  story_id: string;
  added_at: string;
}

export type SnippetKind = 'note' | 'quote' | 'dialogue' | 'outline' | 'prompt';

export interface StoryNotesRow {
  story_id: string;
  user_id: string;
  possible_titles: string[];
  summary: string;
  outline: string;
  genres: string[];
  themes: string[];
  updated_at: string;
}

export interface StoryCharacterRow {
  id: string;
  story_id: string;
  user_id: string;
  name: string;
  role: string | null;
  age: string | null;
  gender: string | null;
  occupation: string | null;
  background: string | null;
  appearance: string | null;
  personality: string | null;
  goals: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface StorySnippetRow {
  id: string;
  story_id: string;
  user_id: string;
  kind: SnippetKind;
  title: string | null;
  body: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SearchResultRow {
  story_id: string;
  story_title: string;
  chapter_id: string;
  chapter_title: string;
  snippet: string;
  rank: number;
}

export interface Database {
  public: {
    Tables: {
      stories: {
        Row: StoryRow;
        Insert: Omit<StoryRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StoryRow, 'id' | 'user_id'>>;
      };
      chapters: {
        Row: ChapterRow;
        Insert: Omit<ChapterRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ChapterRow, 'id' | 'story_id'>>;
      };
      tags: {
        Row: TagRow;
        Insert: Omit<TagRow, 'id'> & { id?: string };
        Update: Partial<Omit<TagRow, 'id' | 'user_id'>>;
      };
      story_tags: {
        Row: StoryTagRow;
        Insert: StoryTagRow;
        Update: Partial<StoryTagRow>;
      };
      reading_progress: {
        Row: ReadingProgressRow;
        Insert: Omit<ReadingProgressRow, 'updated_at'> & { updated_at?: string };
        Update: Partial<ReadingProgressRow>;
      };
      reading_list: {
        Row: ReadingListRow;
        Insert: Omit<ReadingListRow, 'added_at'> & { added_at?: string };
        Update: Partial<ReadingListRow>;
      };
      bookmarks: {
        Row: BookmarkRow;
        Insert: Omit<BookmarkRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BookmarkRow, 'id' | 'user_id'>>;
      };
      story_notes: {
        Row: StoryNotesRow;
        Insert: Omit<StoryNotesRow, 'updated_at'> & { updated_at?: string };
        Update: Partial<Omit<StoryNotesRow, 'story_id' | 'user_id'>>;
      };
      story_characters: {
        Row: StoryCharacterRow;
        Insert: Omit<StoryCharacterRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StoryCharacterRow, 'id' | 'story_id' | 'user_id'>>;
      };
      story_snippets: {
        Row: StorySnippetRow;
        Insert: Omit<StorySnippetRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StorySnippetRow, 'id' | 'story_id' | 'user_id'>>;
      };
    };
    Functions: {
      search_library: {
        Args: { q: string };
        Returns: SearchResultRow[];
      };
    };
  };
}
