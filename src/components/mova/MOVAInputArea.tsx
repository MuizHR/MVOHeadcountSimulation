import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useMOVA } from '../../contexts/MOVAContext';

export const MOVAInputArea: React.FC = () => {
  const { state, sendMessage } = useMOVA();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        if (transcript.trim()) {
          await sendMessage(transcript.trim());
        }
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sendMessage]);

  const handleSend = async () => {
    if (!input.trim() || state.isThinking) return;

    const messageContent = input.trim();
    setInput('');
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const containerClasses = state.isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClasses = state.isDarkMode
    ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
    : 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-200';

  const iconButtonClasses = state.isDarkMode
    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  return (
    <div className={`border-t ${containerClasses} p-4`}>
      <div className="flex items-end gap-2">
        <button
          onClick={toggleRecording}
          className={`p-2 rounded-lg transition-colors ${
            isRecording
              ? 'bg-red-500 text-white'
              : iconButtonClasses
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          disabled={state.isThinking}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? 'Listening...' : 'Ask MOVA anything...'}
          className={`flex-1 px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
          rows={1}
          disabled={state.isThinking || isRecording}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || state.isThinking}
          className={`p-2 rounded-lg transition-colors ${
            input.trim() && !state.isThinking
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {isRecording && (
        <p className="text-xs text-blue-500 mt-2 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Recording... Speak now
        </p>
      )}
    </div>
  );
};
