import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type ContentData = {
  [key: string]: any;
};

interface ContentContextType {
  content: ContentData;
  updateContent: (key: string, value: any) => void;
  isAdmin: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children, isAdmin: propIsAdmin }: { children: React.ReactNode, isAdmin?: boolean }) {
  const [content, setContent] = useState<ContentData>({});
  const [isAdmin, setIsAdmin] = useState(propIsAdmin || false);

  useEffect(() => {
    if (propIsAdmin !== undefined) {
      setIsAdmin(propIsAdmin);
    }
  }, [propIsAdmin]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase.from('content').select('*');
        if (error) throw error;
        
        if (data) {
          const contentMap: ContentData = {};
          data.forEach(item => {
            contentMap[item.key] = item.value;
          });
          setContent(contentMap);
        }
      } catch (err) {
        console.error('Failed to fetch content:', err);
      }
    };

    fetchContent();

    // Internal check for admin users in DB
    const checkUser = async (email?: string | null) => {
      if (!email) return false;
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        return !!data;
      } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
      }
    };

    if (propIsAdmin === undefined) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        setIsAdmin(await checkUser(session?.user?.email));
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsAdmin(await checkUser(session?.user?.email));
      });

      return () => subscription.unsubscribe();
    }
  }, [propIsAdmin]);

  useEffect(() => {
    // Dynamically update document title
    if (content.site_title) {
      document.title = content.site_title;
    }

    // Dynamically update favicon
    const favUrl = content.favicon_url || 'https://shpbvncguqczyohymjjx.supabase.co/storage/v1/object/public/site-images/IMG_0599.PNG';
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = favUrl;
  }, [content.site_title, content.favicon_url]);

  const updateContent = async (key: string, value: any) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    
    try {
      const { error } = await supabase
        .from('content')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
    } catch (e) {
      console.error('Failed to save content:', e);
      // Make silent save failures visible: otherwise the admin sees the change
      // locally (state was already updated above) and assumes it saved, but it
      // never reached the database — so it never appears on other devices.
      if (typeof window !== 'undefined') {
        window.alert(
          'ERRO AO SALVAR: sua alteração NÃO foi salva no servidor e não vai aparecer em outros dispositivos.\n\n' +
          'Verifique sua conexão e tente novamente.'
        );
      }
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, isAdmin }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
