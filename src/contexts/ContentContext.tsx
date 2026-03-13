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

export function ContentProvider({ children, isAdmin }: { children: React.ReactNode, isAdmin: boolean }) {
  const [content, setContent] = useState<ContentData>({});

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
  }, []);

  useEffect(() => {
    // Dynamically update document title
    if (content.site_title) {
      document.title = content.site_title;
    }

    // Dynamically update favicon
    if (content.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = content.favicon_url;
    }
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
