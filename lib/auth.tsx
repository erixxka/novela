import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface UserProfile {
  displayName: string;
  username: string;
  avatarPath: string | null;
  quote: string;
  instagram: string;
  facebook: string;
  wattpad: string;
  readingFontSize: number;
  readingLineSpacing: number;
  readingFont: 'cormorant' | 'inter';
  readingMode: 'pages' | 'scroll';
}

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  profile: UserProfile;
  updateProfile: (fields: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function extractProfile(session: Session | null): UserProfile {
  const meta = session?.user?.user_metadata ?? {};
  return {
    displayName: meta.display_name ?? '',
    username: meta.username ?? '',
    avatarPath: meta.avatar_url ?? null,
    quote: meta.quote ?? '',
    instagram: meta.instagram ?? '',
    facebook: meta.facebook ?? '',
    wattpad: meta.wattpad ?? '',
    readingFontSize: typeof meta.reading_font_size === 'number' ? meta.reading_font_size : 19,
    readingLineSpacing: typeof meta.reading_line_spacing === 'number' ? meta.reading_line_spacing : 1.7,
    readingFont: meta.reading_font === 'inter' ? 'inter' : 'cormorant',
    readingMode: meta.reading_mode === 'scroll' ? 'scroll' : 'pages',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(extractProfile(null));

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setProfile(extractProfile(data.session));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setProfile(extractProfile(s));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (fields: Partial<UserProfile>) => {
    const metaUpdate: Record<string, string | number | null> = {};
    if (fields.displayName !== undefined) metaUpdate.display_name = fields.displayName;
    if (fields.username !== undefined) metaUpdate.username = fields.username;
    if (fields.avatarPath !== undefined) metaUpdate.avatar_url = fields.avatarPath;
    if (fields.quote !== undefined) metaUpdate.quote = fields.quote;
    if (fields.instagram !== undefined) metaUpdate.instagram = fields.instagram;
    if (fields.facebook !== undefined) metaUpdate.facebook = fields.facebook;
    if (fields.wattpad !== undefined) metaUpdate.wattpad = fields.wattpad;
    if (fields.readingFontSize !== undefined) metaUpdate.reading_font_size = fields.readingFontSize;
    if (fields.readingLineSpacing !== undefined) metaUpdate.reading_line_spacing = fields.readingLineSpacing;
    if (fields.readingFont !== undefined) metaUpdate.reading_font = fields.readingFont;
    if (fields.readingMode !== undefined) metaUpdate.reading_mode = fields.readingMode;

    const { data, error } = await supabase.auth.updateUser({ data: metaUpdate });
    if (error) throw error;
    setProfile(extractProfile(data.user ? { ...session, user: data.user } as Session : session));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, profile, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
