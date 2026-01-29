import React, { useState, useEffect, useRef, useMemo } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number; // ms per character when typing
  deletingSpeed?: number; // ms per character when deleting
  pauseDuration?: number; // ms to pause after typing complete
  className?: string;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  phrases,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  className = '',
  style = {},
}) => {
  const [displayText, setDisplayText] = useState('');
  
  // Memoize phrases to prevent effect from restarting on parent re-renders
  const stablePhrases = useMemo(() => phrases, [JSON.stringify(phrases)]);
  
  // Store config in refs so animation loop always has latest values
  const configRef = useRef({ typingSpeed, deletingSpeed, pauseDuration });
  configRef.current = { typingSpeed, deletingSpeed, pauseDuration };

  useEffect(() => {
    // Ensure we have phrases to animate
    if (!stablePhrases || stablePhrases.length === 0) {
      setDisplayText('MARKETING LEADERS'); // Fallback
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    // Initialize with first character of first phrase
    const firstPhrase = stablePhrases[0] || '';
    if (firstPhrase.length > 0) {
      charIndex = 1;
      setDisplayText(firstPhrase.slice(0, 1));
    }

    const tick = () => {
      if (isCancelled) return;
      
      const { typingSpeed, deletingSpeed, pauseDuration } = configRef.current;
      const currentPhrase = stablePhrases[phraseIndex] || '';
      
      // Safety check - if no phrase, cycle to next
      if (!currentPhrase) {
        phraseIndex = (phraseIndex + 1) % stablePhrases.length;
        timeoutId = setTimeout(tick, typingSpeed);
        return;
      }
      
      let nextDelay: number;

      if (isPaused) {
        isPaused = false;
        isDeleting = true;
        nextDelay = deletingSpeed;
      } else if (isDeleting) {
        if (charIndex > 0) {
          charIndex--;
          setDisplayText(currentPhrase.slice(0, charIndex));
          nextDelay = deletingSpeed;
        } else {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % stablePhrases.length;
          charIndex = 0; // Reset for new phrase
          nextDelay = typingSpeed;
        }
      } else {
        // Typing
        if (charIndex < currentPhrase.length) {
          charIndex++;
          setDisplayText(currentPhrase.slice(0, charIndex));
          nextDelay = typingSpeed;
        } else {
          isPaused = true;
          nextDelay = pauseDuration;
        }
      }

      timeoutId = setTimeout(tick, nextDelay);
    };

    // Start animation after initial character
    timeoutId = setTimeout(tick, typingSpeed);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [stablePhrases]);

  return (
    <span className={className} style={style}>
      {displayText}
      <span 
        className="inline-block w-[3px] h-[1em] bg-current ml-0.5 animate-pulse"
        style={{ verticalAlign: 'text-bottom' }}
        aria-hidden="true"
      />
    </span>
  );
};
