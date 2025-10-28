"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Circle } from "lucide-react";

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  disabled?: boolean;
  onSelectionChange?: (selectedIndex: number | null) => void;
  color?: 'blue' | 'orange';
}

export interface MultipleChoiceQuestionRef {
  finalizeAnswer: () => void;
  hasSelection: boolean;
  selectedIndex: number | null;
}

const MultipleChoiceQuestion = forwardRef<MultipleChoiceQuestionRef, MultipleChoiceQuestionProps>(({
  question,
  options,
  correctAnswer,
  explanation,
  onAnswer,
  disabled = false,
  onSelectionChange,
  color = 'blue',
}, ref) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (disabled) return;
    setSelectedIndex(index);
    // Notify parent of selection change but don't finalize answer
    onSelectionChange?.(index);
  };

  const getOptionStyle = (index: number) => {
    // Always allow interaction - no grey disabled state
    const baseColor = color === 'orange' ? 'orange' : 'blue';
    const borderColor = `border-${baseColor}-600`;
    const bottomBorderColor = `border-b-${baseColor}-600`;
    
    if (selectedIndex === index) {
      return `${borderColor} shadow-lg border-b-4 ${bottomBorderColor}`;
    }
    return `${borderColor} shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-b-4 ${bottomBorderColor}`;
  };

  const getIcon = (index: number) => {
    // Always show selection state, no final answer states
    return selectedIndex === index ? (
      <Circle className="h-5 w-5 text-primary fill-primary" />
    ) : (
      <Circle className="h-5 w-5 text-gray-400" />
    );
  };

  // Method to finalize the answer when Complete Task is clicked
  const finalizeAnswer = () => {
    if (selectedIndex !== null) {
      const isCorrect = selectedIndex === correctAnswer;
      setShowResult(true);
      onAnswer(selectedIndex, isCorrect);
    }
  };

  // Expose the finalize method to parent component
  useImperativeHandle(ref, () => ({
    finalizeAnswer,
    hasSelection: selectedIndex !== null,
    selectedIndex
  }));

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
      <div className="space-y-2">
        {options.map((option, index) => (
          <div
            key={index}
            className={`cursor-pointer transition-all duration-200 rounded-2xl border-2 p-3 sm:p-4 ${getOptionStyle(index)}`}
            onClick={() => handleSelect(index)}
          >
            <div className="flex items-center space-x-3">
              {getIcon(index)}
              <span className="flex-1 text-gray-900 dark:text-gray-100 font-medium text-sm sm:text-base">
                {option}
              </span>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
});

MultipleChoiceQuestion.displayName = "MultipleChoiceQuestion";

export default MultipleChoiceQuestion;
