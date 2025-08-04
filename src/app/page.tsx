'use client';
import { useRef } from 'react';
import ScrambleText, { ScrambleTextHandle } from '../components/TextScrambler';;

export default function Page() {
  const scrambleRef = useRef<ScrambleTextHandle>(null);//TextScrambler

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-8">
      <div className="text-2xl font-bold text-gray-800">
        Welcome to the Component Library!
      </div>
      <div>
        <button
        onMouseEnter={() => scrambleRef.current?.startScramble()}
        className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-white hover:text-red-500 transition-colors shadow-md"
      >
        <ScrambleText ref={scrambleRef}>Read More...</ScrambleText>
      </button>
      </div>
      
    </div>
  );
}