import React, { useRef, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { useMOVA } from '../../contexts/MOVAContext';
import { useAuth } from '../../contexts/AuthContext';

export const MOVAMessageList: React.FC = () => {
  const { state } = useMOVA();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [playingMessageId, setPlayingMessageId] = React.useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleTextToSpeech = (messageId: string, content: string) => {
    if (playingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setPlayingMessageId(null);
    };

    setPlayingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const messageListClasses = state.isDarkMode
    ? 'bg-gray-800'
    : 'bg-gray-50';

  const userBubbleClasses = state.isDarkMode
    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
    : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white';

  const movaBubbleClasses = state.isDarkMode
    ? 'bg-gray-700 text-white border border-gray-600'
    : 'bg-white text-gray-900 border border-gray-200';

  const timestampClasses = state.isDarkMode
    ? 'text-gray-400'
    : 'text-gray-500';

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${messageListClasses}`}>
      {state.messages.map((message) => {
        const isUser = message.role === 'user';

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
            }`}>
              {isUser ? getUserInitials() : '🤖'}
            </div>

            <div className={`flex-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 ${
                isUser ? userBubbleClasses : movaBubbleClasses
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>

              <div className={`flex items-center gap-2 mt-1 px-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className={`text-xs ${timestampClasses}`}>
                  {formatTime(message.timestamp)}
                </span>

                {!isUser && (
                  <button
                    onClick={() => handleTextToSpeech(message.id, message.content)}
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                      playingMessageId === message.id ? 'text-blue-500' : timestampClasses
                    }`}
                    aria-label="Read aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {state.isThinking && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
            🤖
          </div>

          <div className={`rounded-2xl px-4 py-3 ${movaBubbleClasses} flex items-center gap-2`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">MOVA is thinking...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
