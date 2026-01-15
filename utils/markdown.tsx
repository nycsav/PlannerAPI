import React from 'react';

/**
 * Simple markdown parser for bold text and bullets
 * Handles **bold** syntax and bullet points
 */
export function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by newlines to handle bullets
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Check if line is a bullet point
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ');
    const cleanLine = isBullet ? line.trim().substring(2) : line;

    // Parse bold text within the line
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(cleanLine)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        parts.push(cleanLine.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(<strong key={`bold-${lineIndex}-${match.index}`} className="font-bold text-bureau-ink">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < cleanLine.length) {
      parts.push(cleanLine.substring(lastIndex));
    }

    if (isBullet) {
      return (
        <li key={`line-${lineIndex}`} className="flex items-start gap-3 mb-3">
          <span className="text-bureau-signal font-bold mt-0.5 text-lg leading-none">•</span>
          <span className="text-base text-bureau-ink leading-relaxed flex-1">{parts}</span>
        </li>
      );
    } else if (line.trim()) {
      return <p key={`line-${lineIndex}`} className="text-base text-bureau-ink leading-relaxed mb-3">{parts}</p>;
    } else {
      return null;
    }
  }).filter(Boolean);
}

/**
 * Parse a single line with markdown (for inline use)
 */
export function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add bold text
    parts.push(<strong key={`bold-${match.index}`} className="font-bold text-bureau-ink">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}
