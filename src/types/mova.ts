export type MOVAPersona = 'expert' | 'advisor' | 'analyst';

export interface MOVAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MOVAState {
  isOpen: boolean;
  isDarkMode: boolean;
  persona: MOVAPersona;
  messages: MOVAMessage[];
  isThinking: boolean;
  position: { x: number; y: number };
}

export interface MOVAContextType {
  state: MOVAState;
  toggleOpen: () => void;
  toggleDarkMode: () => void;
  setPersona: (persona: MOVAPersona) => void;
  sendMessage: (content: string) => Promise<void>;
  resetConversation: () => void;
  setPosition: (x: number, y: number) => void;
}

export interface PersonaConfig {
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
}
