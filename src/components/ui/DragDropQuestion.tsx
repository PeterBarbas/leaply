"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { XCircle } from "lucide-react";

interface Pair {
  left: string;
  right: string;
}

interface DragDropQuestionProps {
  question: string;
  pairs: Pair[];
  explanation?: string;
  onComplete: (matches: { left: string; right: string }[], isCorrect: boolean) => void;
  disabled?: boolean;
}

export default function DragDropQuestion({
  question,
  pairs,
  explanation,
  onComplete,
  disabled = false,
}: DragDropQuestionProps) {
  const [matches, setMatches] = useState<{ left: string; right: string }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ item: string; column: 'left' | 'right' } | null>(null);
  const [incorrectItems, setIncorrectItems] = useState<{ left: string; right: string } | null>(null);
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({});
  const leftRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const rightRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Create mixed up items for both columns using deterministic shuffle
  const { leftItems, rightItems } = useMemo(() => {
    const allLeftItems = pairs.map(p => p.left);
    const allRightItems = pairs.map(p => p.right);
    
    // Use a deterministic shuffle based on the pairs data
    const shuffleArray = (array: string[]) => {
      const shuffled = [...array];
      // Use a simple deterministic shuffle based on string hash
      for (let i = shuffled.length - 1; i > 0; i--) {
        const hash = shuffled[i].split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const j = Math.abs(hash) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    return {
      leftItems: shuffleArray(allLeftItems),
      rightItems: shuffleArray(allRightItems)
    };
  }, [pairs]);

  // Effect to measure and match heights for each row
  useEffect(() => {
    const measureAndMatchHeights = () => {
      const newRowHeights: { [key: number]: number } = {};
      
      // Measure each row and use the height of the taller item
      leftItems.forEach((leftItem, index) => {
        const rightItem = rightItems[index];
        
        // Get the actual DOM elements
        const leftElement = leftRefs.current[leftItem];
        const rightElement = rightRefs.current[rightItem];
        
        if (leftElement && rightElement) {
          // Get the natural heights of both elements
          const leftHeight = leftElement.scrollHeight;
          const rightHeight = rightElement.scrollHeight;
          
          // Use the height of the taller item for both items in the row
          const maxHeight = Math.max(leftHeight, rightHeight);
          newRowHeights[index] = maxHeight;
        }
      });
      
      setRowHeights(newRowHeights);
    };

    // Measure heights after a short delay to ensure DOM is ready
    const timer = setTimeout(measureAndMatchHeights, 100);
    return () => clearTimeout(timer);
  }, [leftItems, rightItems]);

  const handleItemClick = (item: string, column: 'left' | 'right') => {
    if (disabled || showResult) return;
    
    // If item is already matched, prevent interaction
    if (isMatched(item)) return;

    // If no item is selected, select this one
    if (!selectedItem) {
      setSelectedItem({ item, column });
      return;
    }

    // If clicking the same item, deselect it
    if (selectedItem.item === item && selectedItem.column === column) {
      setSelectedItem(null);
      return;
    }

    // If clicking an item from the same column, select the new one
    if (selectedItem.column === column) {
      setSelectedItem({ item, column });
      return;
    }

    // If clicking an item from the opposite column, try to match
    if (selectedItem.column !== column) {
      const leftItem = selectedItem.column === 'left' ? selectedItem.item : item;
      const rightItem = selectedItem.column === 'right' ? selectedItem.item : item;

      // Check if this is a valid match
      const isValidMatch = pairs.some(pair => 
        (pair.left === leftItem && pair.right === rightItem) ||
        (pair.left === rightItem && pair.right === leftItem)
      );

      if (isValidMatch) {
        // Add the match if it doesn't already exist
        const matchExists = matches.some(match => 
          (match.left === leftItem && match.right === rightItem) ||
          (match.left === rightItem && match.right === leftItem)
        );

        if (!matchExists) {
          const newMatch = { left: leftItem, right: rightItem };
          const newMatches = [...matches, newMatch];
          setMatches(newMatches);
          
          // Auto-evaluate when all matches are complete
          if (newMatches.length === pairs.length) {
            const isCorrect = newMatches.every(match => 
              pairs.some(pair => 
                (pair.left === match.left && pair.right === match.right) ||
                (pair.left === match.right && pair.right === match.left)
              )
            );
            setShowResult(true);
            onComplete(newMatches, isCorrect);
          }
        }
      } else {
        // Show incorrect match feedback
        setIncorrectItems({ left: leftItem, right: rightItem });
        
        // Clear the incorrect feedback after 800ms (much faster)
        setTimeout(() => {
          setIncorrectItems(null);
        }, 800);
      }

      // Clear selection after attempting to match
      setSelectedItem(null);
    }
  };



  const isMatched = (item: string) => {
    return matches.some(match => match.left === item || match.right === item);
  };

  const isSelected = (item: string, column: 'left' | 'right') => {
    return selectedItem?.item === item && selectedItem?.column === column;
  };

  const isIncorrect = (item: string, column: 'left' | 'right') => {
    if (!incorrectItems) return false;
    return (column === 'left' && incorrectItems.left === item) || 
           (column === 'right' && incorrectItems.right === item);
  };

  const getItemStyle = (item: string, column: 'left' | 'right') => {
    // If item is matched, make it grey immediately
    if (isMatched(item)) {
      return "border-gray-400 shadow-md opacity-70 cursor-not-allowed";
    }
    if (isIncorrect(item, column)) {
      // Maintain 3D button design with red flash
      return "border-red-600 animate-flash shadow-lg border-b-4 border-b-red-600";
    }
    if (isSelected(item, column)) {
      return column === 'left'
        ? "border-blue-600 shadow-lg transform scale-95 border-b-4 border-b-blue-600"
        : "border-orange-600 shadow-lg transform scale-95 border-b-4 border-b-orange-600";
    }

    // Default 3D button styles
    if (column === 'left') {
      return "border-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-b-4 border-b-blue-600";
    } else {
      return "border-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-b-4 border-b-orange-600";
    }
  };

  const isComplete = matches.length === pairs.length;

  return (
    <div className="space-y-4">
      <style jsx>{`
        @keyframes flash {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        .animate-flash {
          animation: flash 0.8s ease-in-out;
        }
      `}</style>
      
      {/* Desktop: Side-by-side columns with matched heights per row */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-1">
          {leftItems.map((item, index) => (
            <div
              key={`left-${index}`}
              ref={(el) => { leftRefs.current[item] = el; }}
              className={`cursor-pointer transition-all duration-200 rounded-2xl border-2 px-3 py-2 flex items-center justify-center ${getItemStyle(item, 'left')}`}
              style={{ height: rowHeights[index] ? `${rowHeights[index]}px` : 'auto' }}
              onClick={() => handleItemClick(item, 'left')}
            >
              <span className="text-gray-900 dark:text-gray-100 font-semibold text-base text-center drop-shadow-sm">{item}</span>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-1">
          {rightItems.map((item, index) => (
            <div
              key={`right-${index}`}
              ref={(el) => { rightRefs.current[item] = el; }}
              className={`cursor-pointer transition-all duration-200 rounded-2xl border-2 px-3 py-2 flex items-center justify-center ${getItemStyle(item, 'right')}`}
              style={{ height: rowHeights[index] ? `${rowHeights[index]}px` : 'auto' }}
              onClick={() => handleItemClick(item, 'right')}
            >
              <span className="text-gray-900 dark:text-gray-100 font-semibold text-base text-center drop-shadow-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="sm:hidden space-y-4">
        {/* Left Column */}
        <div className="space-y-2">
          {leftItems.map((item, index) => (
            <div
              key={`left-${index}`}
              className={`cursor-pointer transition-all duration-200 rounded-2xl border-2 p-3 ${getItemStyle(item, 'left')}`}
              onClick={() => handleItemClick(item, 'left')}
            >
              <div className="flex items-center justify-center">
                <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm text-center drop-shadow-sm">{item}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div className="text-center mb-10">
          </div>
          {rightItems.map((item, index) => (
            <div
              key={`right-${index}`}
              className={`cursor-pointer transition-all duration-200 rounded-2xl border-2 p-3 ${getItemStyle(item, 'right')}`}
              onClick={() => handleItemClick(item, 'right')}
            >
              <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm text-center drop-shadow-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
