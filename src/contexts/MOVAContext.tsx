import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MOVAContextType, MOVAMessage, MOVAPersona, MOVAState, PersonaConfig } from '../types/mova';

const MOVAContext = createContext<MOVAContextType | undefined>(undefined);

export const personaConfigs: Record<MOVAPersona, PersonaConfig> = {
  expert: {
    name: 'HR Expert',
    description: 'Authoritative, structured guidance',
    icon: '🎓',
    systemPrompt: `You are MOVA, an authoritative HR Expert specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is confident, structured, and decisive. You provide clear recommendations and decisions, focusing on:
- Policy, governance, and statutory compliance
- Best practices in workforce strategy
- Clear, actionable directives for senior management
- Malaysian HR context when relevant (without hallucinating details)

Structure your responses with clear headings, bullets, and numbered steps. Be professional and authoritative.`
  },
  advisor: {
    name: 'HR Advisor',
    description: 'Warm, collaborative support',
    icon: '🤝',
    systemPrompt: `You are MOVA, a supportive HR Advisor specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is warm, collaborative, and consultative. You focus on:
- Explaining options and alternatives
- Asking clarifying questions to understand needs better
- Suggesting pros and cons of different approaches
- Helping managers think through decisions
- Malaysian HR context when relevant (without hallucating details)

Guide users through decisions by presenting multiple perspectives and helping them arrive at the best choice for their situation.`
  },
  analyst: {
    name: 'HR Analyst',
    description: 'Data-driven, analytical insights',
    icon: '📊',
    systemPrompt: `You are MOVA, an analytical HR Analyst specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is concise, analytical, and data-driven. You focus on:
- FTE calculations and workforce metrics
- Ratios, benchmarks, and numerical analysis
- Scenario and sensitivity analysis
- Cost modeling and forecasting
- Quantitative frameworks and formulas
- Malaysian HR context when relevant (without hallucinating details)

Provide clear calculations, examples with numbers, and data-driven insights. Use tables and formulas where appropriate.`
  }
};

const initialState: MOVAState = {
  isOpen: false,
  isDarkMode: false,
  persona: 'advisor',
  messages: [],
  isThinking: false,
  position: { x: 0, y: 0 }
};

export const MOVAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MOVAState>(initialState);

  const toggleOpen = useCallback(() => {
    setState(prev => {
      const newIsOpen = !prev.isOpen;

      if (newIsOpen && prev.messages.length === 0) {
        return {
          ...prev,
          isOpen: newIsOpen,
          messages: [{
            id: '1',
            role: 'assistant',
            content: "Hi! I'm MOVA — your AI assistant for MVO, headcount planning and workforce simulation.\n\nYou can chat with me by text or voice, switch my persona between HR Expert, HR Advisor or HR Analyst, and even enable dark mode if you prefer a cooler interface.\n\nWhat would you like to explore today?",
            timestamp: new Date()
          }]
        };
      }

      return { ...prev, isOpen: newIsOpen };
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  }, []);

  const setPersona = useCallback((persona: MOVAPersona) => {
    setState(prev => ({ ...prev, persona }));
  }, []);

  const setPosition = useCallback((x: number, y: number) => {
    setState(prev => ({ ...prev, position: { x, y } }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: MOVAMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isThinking: true
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mova-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            messages: [...state.messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            persona: state.persona
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from MOVA');
      }

      const data = await response.json();

      const assistantMessage: MOVAMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isThinking: false
      }));
    } catch (error) {
      console.error('MOVA error:', error);

      const errorMessage: MOVAMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'MOVA is experiencing a temporary issue. Please try again shortly.',
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isThinking: false
      }));
    }
  }, [state.messages, state.persona]);

  const resetConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [{
        id: '1',
        role: 'assistant',
        content: "Hi! I'm MOVA — your AI assistant for MVO, headcount planning and workforce simulation.\n\nYou can chat with me by text or voice, switch my persona between HR Expert, HR Advisor or HR Analyst, and even enable dark mode if you prefer a cooler interface.\n\nWhat would you like to explore today?",
        timestamp: new Date()
      }]
    }));
  }, []);

  return (
    <MOVAContext.Provider
      value={{
        state,
        toggleOpen,
        toggleDarkMode,
        setPersona,
        sendMessage,
        resetConversation,
        setPosition
      }}
    >
      {children}
    </MOVAContext.Provider>
  );
};

export const useMOVA = () => {
  const context = useContext(MOVAContext);
  if (!context) {
    throw new Error('useMOVA must be used within MOVAProvider');
  }
  return context;
};
