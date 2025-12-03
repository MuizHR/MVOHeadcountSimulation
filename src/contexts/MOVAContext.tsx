import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MOVAContextType, MOVAMessage, MOVAPersona, MOVAState, PersonaConfig, QuickActionType, FAQItem, QuickAction, AnalyticsEvent, SessionContext, DashboardPreviewData } from '../types/mova';

const MOVAContext = createContext<MOVAContextType | undefined>(undefined);

export const personaConfigs: Record<MOVAPersona, PersonaConfig> = {
  expert: {
    name: 'HR Expert',
    description: 'Authoritative, structured guidance',
    fullDescription: 'Best for clear, top-down recommendations and policy-aligned decisions.',
    icon: '🎓',
    systemPrompt: `You are MOVA, an authoritative HR Expert specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is confident, structured, and decisive. You provide clear recommendations and decisions, focusing on policy, governance, statutory compliance, best practices in workforce strategy, clear actionable directives for senior management, and Malaysian HR context when relevant (without hallucinating details).

Structure your responses with clear headings, bullets, and numbered steps. Be professional and authoritative. Clean your responses of markdown symbols for TTS compatibility when needed.`
  },
  advisor: {
    name: 'HR Advisor',
    description: 'Warm, collaborative support',
    fullDescription: 'Best for exploring options, pros and cons, and collaborative decisions.',
    icon: '🤝',
    systemPrompt: `You are MOVA, a supportive HR Advisor specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is warm, collaborative, and consultative. You focus on explaining options and alternatives, asking clarifying questions to understand needs better, suggesting pros and cons of different approaches, helping managers think through decisions, and Malaysian HR context when relevant (without hallucinating details).

Guide users through decisions by presenting multiple perspectives and helping them arrive at the best choice for their situation. Clean your responses of markdown symbols for TTS compatibility when needed.`
  },
  analyst: {
    name: 'HR Analyst',
    description: 'Data-driven, analytical insights',
    fullDescription: 'Best for numerical analysis, FTE calculations, and comparing scenarios.',
    icon: '📊',
    systemPrompt: `You are MOVA, an analytical HR Analyst specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is concise, analytical, and data-driven. You focus on FTE calculations and workforce metrics, ratios, benchmarks and numerical analysis, scenario and sensitivity analysis, cost modeling and forecasting, quantitative frameworks and formulas, and Malaysian HR context when relevant (without hallucinating details).

Provide clear calculations, examples with numbers, and data-driven insights. Use tables and formulas where appropriate. Clean your responses of markdown symbols for TTS compatibility when needed.`
  }
};

export const faqItems: FAQItem[] = [
  {
    id: 'fte-calculation',
    icon: '👥',
    question: 'How do I calculate FTE accurately?',
    tooltip: 'Learn the formula and assumptions used to estimate staffing levels.'
  },
  {
    id: 'mvo-flow',
    icon: '📋',
    question: 'What is the full MVO simulation flow?',
    tooltip: 'Understand the step-by-step process behind the simulator.'
  },
  {
    id: 'optimize-cost',
    icon: '💰',
    question: 'How do I optimize manpower cost?',
    tooltip: 'See cost levers like automation, outsourcing, and role mix.'
  },
  {
    id: 'automation',
    icon: '🤖',
    question: 'What tasks can be automated or outsourced?',
    tooltip: 'Identify tasks suitable for automation or external vendors.'
  },
  {
    id: 'team-structure',
    icon: '🏗️',
    question: 'How do I design the right team structure?',
    tooltip: 'Learn how to create a Minimum Viable Organization design.'
  },
  {
    id: 'risk-buffer',
    icon: '🛡️',
    question: 'What is workforce risk buffer?',
    tooltip: 'Understand the safety margin for avoiding under-capacity.'
  }
];

export const quickActions: QuickAction[] = [
  {
    id: 'fte-simulation',
    icon: '⚡',
    label: 'Run FTE Simulation',
    prompt: 'I need to run an FTE simulation. Can you guide me through the process and help me calculate the required headcount?'
  },
  {
    id: 'calculate-productivity',
    icon: '🧮',
    label: 'Calculate Productivity',
    prompt: 'I need help calculating productivity metrics and throughput per role. Can you assist?'
  },
  {
    id: 'automation-potential',
    icon: '🤖',
    label: 'Check Automation Potential',
    prompt: 'Can you analyze which tasks in my workflow have automation potential and estimate the impact?'
  },
  {
    id: 'summary-report',
    icon: '📊',
    label: 'Generate Summary Report',
    prompt: 'Please generate a summary report of our current workforce planning analysis including FTE, costs, and recommendations.'
  },
  {
    id: 'mvo-structure',
    icon: '🧱',
    label: 'Build MVO Structure',
    prompt: 'Help me design a Minimum Viable Organization structure for my team/function.'
  },
  {
    id: 'review-assumptions',
    icon: '🛠️',
    label: 'Review Assumptions',
    prompt: 'Can you review all the assumptions I\'ve entered so far and highlight any that might need adjustment?'
  }
];

const initialState: MOVAState = {
  isOpen: false,
  isDarkMode: false,
  persona: 'advisor',
  messages: [],
  isThinking: false,
  position: { x: 0, y: 0 },
  hasCompletedOnboarding: false,
  showWhatsNew: false,
  isQuickActionsExpanded: true,
  showFAQ: true,
  sessionContext: {
    fteValues: {},
    workloadUnits: {},
    costParameters: {},
    projectContext: '',
    usedQuickActions: [],
    usedFAQs: []
  }
};

const analytics: AnalyticsEvent[] = [];

export const MOVAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MOVAState>(initialState);

  const trackAnalytics = useCallback((event: string, data?: any) => {
    analytics.push({
      event,
      timestamp: new Date(),
      data
    });
    console.log('[MOVA Analytics]', event, data);
  }, []);

  const toggleOpen = useCallback(() => {
    setState(prev => {
      const newIsOpen = !prev.isOpen;

      if (newIsOpen && prev.messages.length === 0) {
        trackAnalytics('mova_opened');
        return {
          ...prev,
          isOpen: newIsOpen,
          showFAQ: true,
          messages: [{
            id: '1',
            role: 'assistant',
            content: "Hi! I'm MOVA — your AI assistant for MVO, workforce planning and headcount simulation.\n\nYou can use text or voice, explore FAQs, run Quick Actions, or follow the Getting Started guide.\n\nWould you like to start with a quick simulation, an FAQ, or a short walkthrough?",
            timestamp: new Date()
          }]
        };
      }

      return { ...prev, isOpen: newIsOpen };
    });
  }, [trackAnalytics]);

  const toggleDarkMode = useCallback(() => {
    setState(prev => {
      trackAnalytics('dark_mode_toggled', { enabled: !prev.isDarkMode });
      return { ...prev, isDarkMode: !prev.isDarkMode };
    });
  }, [trackAnalytics]);

  const setPersona = useCallback((persona: MOVAPersona) => {
    setState(prev => {
      trackAnalytics('persona_changed', { from: prev.persona, to: persona });
      return { ...prev, persona };
    });
  }, [trackAnalytics]);

  const setPosition = useCallback((x: number, y: number) => {
    setState(prev => ({ ...prev, position: { x, y } }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => {
      trackAnalytics('onboarding_completed');
      return { ...prev, hasCompletedOnboarding: true };
    });
  }, [trackAnalytics]);

  const toggleWhatsNew = useCallback(() => {
    setState(prev => ({ ...prev, showWhatsNew: !prev.showWhatsNew }));
  }, []);

  const toggleQuickActions = useCallback(() => {
    setState(prev => {
      trackAnalytics('quick_actions_toggled', { expanded: !prev.isQuickActionsExpanded });
      return { ...prev, isQuickActionsExpanded: !prev.isQuickActionsExpanded };
    });
  }, [trackAnalytics]);

  const updateSessionContext = useCallback((key: keyof SessionContext, value: any) => {
    setState(prev => ({
      ...prev,
      sessionContext: {
        ...prev.sessionContext,
        [key]: value
      }
    }));
  }, []);

  const sendMessage = useCallback(async (content: string, isDashboardPreview = false, dashboardData?: DashboardPreviewData) => {
    const userMessage: MOVAMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isThinking: true,
      showFAQ: false
    }));

    trackAnalytics('message_sent', { contentLength: content.length });

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
            persona: state.persona,
            sessionContext: state.sessionContext
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
        timestamp: new Date(),
        isDashboardPreview,
        dashboardData
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isThinking: false
      }));

      trackAnalytics('message_received');
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

      trackAnalytics('message_error', { error: error instanceof Error ? error.message : 'Unknown' });
    }
  }, [state.messages, state.persona, state.sessionContext, trackAnalytics]);

  const handleQuickAction = useCallback(async (action: QuickActionType) => {
    const quickAction = quickActions.find(qa => qa.id === action);
    if (!quickAction) return;

    trackAnalytics('quick_action_used', { action });

    setState(prev => ({
      ...prev,
      sessionContext: {
        ...prev.sessionContext,
        usedQuickActions: [...prev.sessionContext.usedQuickActions, action]
      }
    }));

    await sendMessage(quickAction.prompt);
  }, [sendMessage, trackAnalytics]);

  const handleFAQ = useCallback(async (question: string) => {
    const faqItem = faqItems.find(f => f.question === question);
    if (!faqItem) return;

    trackAnalytics('faq_used', { faqId: faqItem.id });

    setState(prev => ({
      ...prev,
      sessionContext: {
        ...prev.sessionContext,
        usedFAQs: [...prev.sessionContext.usedFAQs, faqItem.id]
      }
    }));

    await sendMessage(question);
  }, [sendMessage, trackAnalytics]);

  const resetConversation = useCallback(() => {
    setState(prev => ({
      ...initialState,
      isDarkMode: prev.isDarkMode,
      persona: prev.persona,
      hasCompletedOnboarding: prev.hasCompletedOnboarding,
      messages: [{
        id: '1',
        role: 'assistant',
        content: "Hi! I'm MOVA — your AI assistant for MVO, workforce planning and headcount simulation.\n\nYou can use text or voice, explore FAQs, run Quick Actions, or follow the Getting Started guide.\n\nWould you like to start with a quick simulation, an FAQ, or a short walkthrough?",
        timestamp: new Date()
      }],
      showFAQ: true
    }));
    trackAnalytics('conversation_reset');
  }, [trackAnalytics]);

  return (
    <MOVAContext.Provider
      value={{
        state,
        toggleOpen,
        toggleDarkMode,
        setPersona,
        sendMessage,
        resetConversation,
        setPosition,
        completeOnboarding,
        toggleWhatsNew,
        toggleQuickActions,
        handleQuickAction,
        handleFAQ,
        trackAnalytics,
        updateSessionContext
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
