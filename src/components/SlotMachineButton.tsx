import React, { useState, useEffect, useRef, ReactNode, ButtonHTMLAttributes, MouseEventHandler } from 'react';

interface ScrambleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  scrambleSpeed?: number;
  lockDelay?: number;
}

const ScrambleButton: React.FC<ScrambleButtonProps> = ({ 
  children, 
  className = '', 
  onClick,
  scrambleSpeed = 50,
  lockDelay = 100,
  ...props 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetText = children?.toString() || '';
  
  // Characters to cycle through
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  
  // Initialize with scrambled text
  useEffect(() => {
    const scrambled = targetText
      .split('')
      .map((char: string) => char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)])
      .join('');
    setDisplayText(scrambled);
  }, [targetText]);

  const scrambleText = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const lockedPositions = new Set<number>();
    let iterationCount = 0;
    
    intervalRef.current = setInterval(() => {
      setDisplayText(prevText => {
        return prevText
          .split('')
          .map((char: string, index) => {
            // Keep spaces as spaces
            if (targetText[index] === ' ') return ' ';
            
            // Check if this position should be locked
            const shouldLock = iterationCount > (index * lockDelay / scrambleSpeed);
            
            if (shouldLock && !lockedPositions.has(index)) {
              lockedPositions.add(index);
              return targetText[index];
            }
            
            // If already locked, keep the correct character
            if (lockedPositions.has(index)) {
              return targetText[index];
            }
            
            // Otherwise, show random character
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
      });
      
      iterationCount++;
      
      // Stop when all positions are locked
      if (lockedPositions.size === targetText.replace(/\s/g, '').length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, scrambleSpeed);
  };

  const resetToScrambled = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const scrambled = targetText
      .split('')
      .map((char: string) => char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)])
      .join('');
    setDisplayText(scrambled);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scrambleText();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    resetToScrambled();
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <button
      className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-mono font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      <span className="inline-block min-w-0">
        {displayText.split('').map((char, index) => (
          <span
            key={index}
            className="inline-block transition-all duration-200"
            style={{
              transitionDelay: isHovered ? `${index * 50}ms` : '0ms'
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </button>
  );
};

// Higher-order component to easily add scramble effect to any button
const withScrambleEffect = (
  WrappedButton: React.ComponentType<any>, 
  options: Partial<ScrambleButtonProps> = {}
) => {
  return ({ children, ...props }: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => (
    <ScrambleButton {...options} {...props}>
      {children}
    </ScrambleButton>
  );
};

// Usage examples
const ExampleUsage = () => {
  // Create custom scramble buttons
  const QuickScrambleButton = withScrambleEffect(ScrambleButton, {
    scrambleSpeed: 30,
    lockDelay: 80
  });
  
  const SlowScrambleButton = withScrambleEffect(ScrambleButton, {
    scrambleSpeed: 80,
    lockDelay: 150
  });

  return (
    <div className="p-8 space-y-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Text Scramble Button Examples</h1>
      
      <div className="space-y-4">
        <ScrambleButton onClick={() => alert('Read more clicked!')}>
          Read More
        </ScrambleButton>
        
        <ScrambleButton 
          scrambleSpeed={30}
          lockDelay={60}
          className="bg-gradient-to-r from-red-500 to-orange-500"
          onClick={() => alert('Get started!')}
        >
          Get Started
        </ScrambleButton>
        
        <QuickScrambleButton className="bg-gradient-to-r from-green-500 to-teal-500">
          Learn More
        </QuickScrambleButton>
        
        <SlowScrambleButton className="bg-gradient-to-r from-pink-500 to-rose-500">
          Contact Us
        </SlowScrambleButton>
        
        <ScrambleButton 
          scrambleSpeed={40}
          lockDelay={120}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          Download Now
        </ScrambleButton>
      </div>
      
      <div className="mt-12 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">How to use:</h2>
        <div className="bg-gray-700 p-4 rounded text-green-400 font-mono text-sm">
          {`<ScrambleButton 
  scrambleSpeed={50}    // Speed of character cycling (ms)
  lockDelay={100}       // Delay between each letter locking (ms)
  onClick={() => {}}    // Your click handler
  className="..."       // Additional styles
>
  Your Text Here
</ScrambleButton>`}
        </div>
      </div>
    </div>
  );
};

export default ScrambleButton;
export { withScrambleEffect, ScrambleButton as SlotMachineButton };