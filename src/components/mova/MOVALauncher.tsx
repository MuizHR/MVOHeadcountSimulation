import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useMOVA } from '../../contexts/MOVAContext';

export const MOVALauncher: React.FC = () => {
  const { toggleOpen } = useMOVA();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleOpen}
        className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse-subtle"
        aria-label="Chat with MOVA"
      >
        <MessageCircle className="w-8 h-8 text-white" />

        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Chat with MOVA
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>

        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 animate-ping-slow opacity-20"></div>
      </button>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};
