import React, { useRef, useState, useEffect } from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { useMOVA } from '../../contexts/MOVAContext';
import { MOVAMessageList } from './MOVAMessageList';
import { MOVAInputArea } from './MOVAInputArea';
import { MOVAPersonaSelector } from './MOVAPersonaSelector';

export const MOVAWindow: React.FC = () => {
  const { state, toggleOpen, toggleDarkMode, setPosition } = useMOVA();
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!state.isOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !windowRef.current) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const windowWidth = windowRef.current.offsetWidth;
      const windowHeight = windowRef.current.offsetHeight;

      const maxX = window.innerWidth - windowWidth;
      const maxY = window.innerHeight - windowHeight;

      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));

      setPosition(clampedX, clampedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, setPosition, state.isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!windowRef.current) return;

    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  if (!state.isOpen) return null;

  const themeClasses = state.isDarkMode
    ? 'bg-gray-900 text-white'
    : 'bg-white text-gray-900';

  const position = state.position.x === 0 && state.position.y === 0
    ? { bottom: '6rem', right: '1.5rem' }
    : { left: `${state.position.x}px`, top: `${state.position.y}px` };

  return (
    <div
      ref={windowRef}
      className={`fixed z-50 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-slide-up ${themeClasses}`}
      style={position}
    >
      <div
        ref={headerRef}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 cursor-move flex items-center justify-between"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">MOVA – AI Assistant</h2>
            <p className="text-white/80 text-xs">Your HR Planning Expert</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Toggle dark mode"
          >
            {state.isDarkMode ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={toggleOpen}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close MOVA"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <MOVAPersonaSelector />

      <MOVAMessageList />

      <MOVAInputArea />

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
