import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Load content from backend on mount
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setContent(data);
        }
      })
      .catch(e => console.error('Failed to fetch content', e));
  }, []);

  const updateContent = async (key: string, value: any) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });
    } catch (e) {
      console.error('Failed to save content', e);
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
