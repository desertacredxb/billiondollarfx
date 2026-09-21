import React from 'react';

interface ChatMarkdownProps {
  content: string;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content }) => {
  // Ultra-lightweight markdown engine targeting lists, styling and line breaks safely without external package dependency injection bloat
  const lines = content.split('\n');

  return (
    <div className="space-y-1 text-sm leading-relaxed whitespace-pre-line">
      {lines.map((line, idx) => {
        let cleanLine = line;

        // Render bullet points cleanly
        if (cleanLine.trim().startsWith('•') || cleanLine.trim().startsWith('-')) {
          const itemText = cleanLine.replace(/^[•-]\s*/, '');
          return (
            <ul key={idx} className="list-disc pl-4 my-1">
              <li dangerouslySetInnerHTML={{ __html: parseBold(itemText) }} />
            </ul>
          );
        }

        return <p key={idx} dangerouslySetInnerHTML={{ __html: parseBold(cleanLine) }} />;
      })}
    </div>
  );
};

function parseBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
}