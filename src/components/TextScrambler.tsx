// components/ScrambleText.tsx (updated with export on interface and consistent naming)
'use client'; // Use this for client-side hooks in Next.js App Router

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface ScrambleTextHandle { // Added 'export' to make the interface importable
  startScramble: () => void;
}

interface ScrambleTextProps {
  children: string;
  scrambleChars?: string; // Optional: Custom set of scramble characters
  speed?: number; // Optional: ms per step
}

const ScrambleText = forwardRef<ScrambleTextHandle, ScrambleTextProps>(
  ({ children: originalText, scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()', speed = 50 }, ref) => {
    const textRef = useRef<HTMLSpanElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isScrambling, setIsScrambling] = useState(false);

    const randomChars = (length: number): string => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += scrambleChars.charAt(Math.floor(Math.random() * scrambleChars.length));
      }
      return result;
    };

    const startScramble = () => {
      if (isScrambling || !textRef.current) return;
      setIsScrambling(true);
      let prefixLength = 0;
      textRef.current.textContent = randomChars(originalText.length); // Start with full scramble

      intervalRef.current = setInterval(() => {
        if (textRef.current) {
          const prefix = originalText.slice(0, prefixLength);
          const suffix = randomChars(originalText.length - prefixLength);
          textRef.current.textContent = prefix + suffix;
        }
        prefixLength++;
        if (prefixLength > originalText.length) {
          if (textRef.current) {
            textRef.current.textContent = originalText;
          }
          clearInterval(intervalRef.current!);
          setIsScrambling(false);
        }
      }, speed); // Use customizable speed
    };

    useImperativeHandle(ref, () => ({
      startScramble,
    }));

    return <span ref={textRef}>{originalText}</span>;
  }
);

ScrambleText.displayName = 'ScrambleText';

export default ScrambleText;