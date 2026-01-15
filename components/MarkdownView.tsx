
import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowDownCircle, Maximize2, X, ZoomIn } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  variant?: 'dark' | 'light'; // dark = Specter (AI), light = Joker (User)
}

const MermaidBlock = ({ code }: { code: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const encoded = useMemo(() => {
    try {
        // Encoding for mermaid.ink
        // Using dark background setting to match app theme
        const str = window.btoa(unescape(encodeURIComponent(code)));
        return `https://mermaid.ink/img/${str}?bgColor=000000`;
    } catch (e) {
        return "";
    }
  }, [code]);

  if (!encoded) return <pre className="text-xs text-red-500">{code}</pre>;

  return (
    <>
      {/* Thumbnail View in Chat */}
      <div 
        className="my-6 relative group cursor-pointer transition-transform hover:scale-[1.01]"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute -top-3 left-4 bg-p5-yellow text-black text-xs font-bold px-2 py-1 transform -skew-x-12 border border-black z-10">
            SCHEMATIC BLUEPRINT
        </div>
        
        <div className="bg-black border-2 border-p5-red p-2 shadow-[4px_4px_0_#fff]">
            <div className="relative bg-[#0a0a0a] p-4 flex justify-center items-center overflow-hidden min-h-[150px]">
                {/* Image */}
                <img src={encoded} alt="Mermaid Diagram" className="max-w-full max-h-[300px] object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <ZoomIn size={32} className="text-white drop-shadow-md" />
                    <span className="text-white font-display uppercase tracking-widest text-sm bg-black px-2">Click to Analyze</span>
                </div>
            </div>
        </div>
      </div>

      {/* Fullscreen Lightbox (Modal) */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in"
            onClick={() => setIsOpen(false)}
        >
            {/* Close Button */}
            <button className="absolute top-4 right-4 text-white hover:text-p5-red transition-colors p-2 border-2 border-white hover:border-p5-red rounded-full">
                <X size={32} />
            </button>

            {/* Modal Content */}
            <div 
                className="relative max-w-[95vw] max-h-[90vh] overflow-auto border-4 border-p5-blue bg-[#050505] p-2 shadow-[0_0_50px_rgba(0,71,187,0.5)]"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image content
            >
                <div className="absolute top-0 left-0 bg-p5-blue text-white px-4 py-1 font-display text-sm tracking-widest">
                    FULL SCALE VIEW
                </div>
                
                <img 
                    src={encoded} 
                    alt="Full Mermaid Diagram" 
                    className="w-auto h-auto min-w-[50vw] object-contain mx-auto"
                />
            </div>
        </div>
      )}
    </>
  );
};

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, variant = 'dark' }) => {
  // Strategy: Split content into logical chunks (paragraphs/blocks).
  // Display chunks in batches. Wait for user input to show more.
  
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const CHUNK_SIZE = 3; // Number of blocks to show at a time
  const containerRef = useRef<HTMLDivElement>(null);

  const blocks = useMemo(() => {
      // Split by double newline, preserving code blocks roughly
      // This regex handles code blocks (```) to avoid splitting inside them
      // Simplified approach: Split by newline, but rejoin code blocks if needed. 
      // For stability with complex markdown, using ReactMarkdown directly on full content 
      // is safer, but for the "RPG Typing" effect, we split.
      
      const rawBlocks = content.split(/\n\n+/);
      return rawBlocks.filter(b => b.trim().length > 0);
  }, [content]);

  useEffect(() => {
    // Reset or Initialize
    if (variant === 'light') {
        // User messages show instantly
        setVisibleCount(blocks.length);
    } else {
        // AI messages start with initial chunk
        setVisibleCount(CHUNK_SIZE);
    }
  }, [blocks, variant]);

  const handleShowMore = () => {
    if (visibleCount < blocks.length) {
        setVisibleCount(prev => Math.min(prev + CHUNK_SIZE, blocks.length));
    }
  };

  // Keyboard listener for Enter to advance
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (variant === 'dark' && visibleCount < blocks.length && e.key === 'Enter') {
              handleShowMore();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleCount, blocks.length, variant]);

  // Styles for Dark Background (Specter) -> White Text
  const darkThemeStyles = {
    h1: "bg-p5-red text-white border-white",
    h2: "text-p5-red border-p5-red",
    h3: "text-white",
    p: "text-white",
    strong: "text-p5-yellow text-shadow-black",
    blockquote: "bg-gray-900 text-white border-p5-yellow",
    code: "bg-gray-800 text-p5-yellow border-gray-600",
    th: "bg-p5-red text-white",
    td: "bg-gray-900 text-white border-gray-700"
  };

  // Styles for Light Background (User/Other) -> Black Text
  const lightThemeStyles = {
    h1: "bg-black text-white border-p5-red",
    h2: "text-black border-black",
    h3: "text-black font-black",
    p: "text-black font-medium",
    strong: "text-p5-red",
    blockquote: "bg-gray-100 text-black border-black",
    code: "bg-white text-p5-red border-black font-bold",
    th: "bg-black text-white",
    td: "bg-white text-black border-black"
  };

  const theme = variant === 'dark' ? darkThemeStyles : lightThemeStyles;

  return (
    <div ref={containerRef} className={`markdown-content font-body tracking-wide ${variant === 'dark' ? 'text-white' : 'text-black'} space-y-4`}>
      {blocks.slice(0, visibleCount).map((block, index) => (
        <div 
            key={index} 
            className={`animate-pop-in origin-bottom-left ${variant === 'dark' ? 'chat-bubble-ai' : ''}`}
            style={{ animationDelay: `${index % CHUNK_SIZE * 100}ms` }}
        >
             <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                h1: ({node, ...props}) => <h1 className={`${theme.h1} px-4 py-1 text-2xl font-display uppercase transform -skew-x-12 inline-block border-2 shadow-[2px_2px_0_#000] mb-2`} {...props} />,
                h2: ({node, ...props}) => <h2 className={`${theme.h2} text-xl font-display uppercase border-b-4 mb-2 mt-2 inline-block`} {...props} />,
                h3: ({node, ...props}) => <h3 className={`${theme.h3} text-lg font-bold mt-2 mb-1`} {...props} />,
                p: ({node, ...props}) => <p className={`${theme.p} mb-2 leading-relaxed text-lg`} {...props} />,
                strong: ({node, ...props}) => <strong className={`${theme.strong} font-black`} {...props} />,
                blockquote: ({node, ...props}) => <blockquote className={`${theme.blockquote} border-l-8 p-3 my-2 italic transform -skew-x-3`} {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1 my-2 marker:text-p5-red" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-1 my-2 marker:font-bold marker:text-p5-yellow" {...props} />,
                
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isMermaid = match && match[1] === 'mermaid';

                    if (!inline && isMermaid) {
                        return <MermaidBlock code={String(children).replace(/\n$/, '')} />;
                    }

                    return !inline && match ? (
                    <pre className="bg-black border-2 border-white p-3 overflow-x-auto my-3 shadow-[4px_4px_0_#D91C24]">
                        <code className="text-white font-mono" {...props}>
                        {children}
                        </code>
                    </pre>
                    ) : (
                    <code className={`${theme.code} px-2 py-0.5 mx-1 font-mono text-sm border shadow-sm`} {...props}>
                        {children}
                    </code>
                    );
                },
                table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-4 border-2 border-white shadow-[6px_6px_0_rgba(0,0,0,0.5)] transform rotate-1">
                        <table className="w-full border-collapse bg-gray-900 text-sm md:text-base" {...props} />
                    </div>
                ),
                th: ({node, ...props}) => <th className={`${theme.th} p-3 text-left font-display tracking-wider border border-white/30`} {...props} />,
                td: ({node, ...props}) => <td className={`${theme.td} p-3 border border-white/20`} {...props} />
                }}
            >
                {block}
            </ReactMarkdown>
        </div>
      ))}

      {/* Progressive Disclosure Button */}
      {variant === 'dark' && visibleCount < blocks.length && (
          <div className="pt-4 pb-2 flex justify-center animate-bounce">
              <button 
                onClick={handleShowMore}
                className="group relative bg-black text-p5-yellow border-2 border-p5-yellow px-6 py-2 transform skew-x-12 hover:bg-p5-yellow hover:text-black transition-colors outline-none focus:ring-2 focus:ring-white"
              >
                  <div className="flex items-center gap-2 transform -skew-x-12 font-display tracking-widest uppercase text-sm">
                      <ArrowDownCircle size={18} />
                      Tap to Continue (Enter)
                  </div>
              </button>
          </div>
      )}
    </div>
  );
};
