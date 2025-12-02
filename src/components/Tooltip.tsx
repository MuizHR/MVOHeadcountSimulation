import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  title: string;
  content: string;
}

export function Tooltip({ title, content }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg left-0 top-6">
          <div className="font-semibold text-gray-900 mb-2 text-sm">{title}</div>
          <div className="text-sm text-gray-700 leading-relaxed">{content}</div>
        </div>
      )}
    </div>
  );
}
