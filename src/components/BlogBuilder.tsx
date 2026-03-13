import React from 'react';

interface BlogBlock {
  id: string;
  type: 'title' | 'text' | 'image' | 'carousel' | 'grid' | 'video' | 'divider';
  content: any;
  settings?: any;
}

interface BlogBuilderProps {
  content: string | BlogBlock[];
}

export default function BlogBuilder({ content }: BlogBuilderProps) {
  let blocks: BlogBlock[] = [];

  try {
    if (typeof content === 'string') {
      blocks = JSON.parse(content);
    } else if (Array.isArray(content)) {
      blocks = content;
    }
  } catch (e) {
    // Fallback if not JSON
    return (
      <div 
        className="prose prose-lg prose-wine max-w-none text-wine-900"
        dangerouslySetInnerHTML={{ __html: String(content) }}
      />
    );
  }

  if (!Array.isArray(blocks)) {
     return <div className="prose prose-lg prose-wine max-w-none text-wine-900" dangerouslySetInnerHTML={{ __html: String(content) }} />;
  }

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        switch (block.type) {
          case 'title':
            const level = block.settings?.level || 2;
            const CustomTag = `h${level}` as keyof JSX.IntrinsicElements;
            return React.createElement(CustomTag, { 
              key: block.id, 
              className: "font-serif font-bold text-wine-950 leading-tight " + 
                (level === 1 ? "text-4xl md:text-6xl mb-8" : 
                 level === 2 ? "text-3xl md:text-5xl mb-6" : "text-2xl md:text-4xl mb-4")
            }, block.content);
          
          case 'text':
            return (
              <p key={block.id} className="text-xl leading-relaxed text-wine-800 font-serif whitespace-pre-wrap">
                {block.content}
              </p>
            );

          case 'image':
            return (
              <figure key={block.id} className="my-10">
                <img 
                  src={block.content} 
                  alt={block.settings?.caption || 'Imagem do blog'} 
                  className="rounded-3xl shadow-xl w-full object-cover max-h-[600px]"
                />
                {block.settings?.caption && (
                  <figcaption className="mt-4 text-center text-sm text-wine-400 font-sans italic">
                    {block.settings.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'divider':
            return <hr key={block.id} className="border-t border-wine-100 my-12" />;

          default:
            return null;
        }
      })}
    </div>
  );
}
