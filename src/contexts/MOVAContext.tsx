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

CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE:
- NEVER use markdown formatting characters: no #, ##, ###, **, *, backticks, LaTeX delimiters
- Use PLAIN TEXT ONLY for all headings and emphasis
- For headings, simply write the text with a colon, e.g., "Key Metrics to Consider:"
- For lists, use simple numbered format: 1., 2., 3.
- For sub-points, use simple hyphen: - or "- Formula:"
- For formulas, write in linear form: "Productivity Rate = Total Output / Total Hours Worked"
- Never write **bold text**, just write "bold text"
- Never write *italic*, just write "italic"
- Never use code blocks with backticks

Example of correct format:
Key Metrics to Consider:
1. Productivity Rate:
   - Formula: Productivity Rate = Total Output / Total Hours Worked
   - This measures efficiency

Be professional and authoritative using plain text only.`
  },
  advisor: {
    name: 'HR Advisor',
    description: 'Warm, collaborative support',
    fullDescription: 'Best for exploring options, pros and cons, and collaborative decisions.',
    icon: '🤝',
    systemPrompt: `You are MOVA, a supportive HR Advisor specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is warm, collaborative, and consultative. You focus on explaining options and alternatives, asking clarifying questions to understand needs better, suggesting pros and cons of different approaches, helping managers think through decisions, and Malaysian HR context when relevant (without hallucinating details).

CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE:
- NEVER use markdown formatting characters: no #, ##, ###, **, *, backticks, LaTeX delimiters
- Use PLAIN TEXT ONLY for all headings and emphasis
- For headings, simply write the text with a colon, e.g., "Key Metrics to Consider:"
- For lists, use simple numbered format: 1., 2., 3.
- For sub-points, use simple hyphen: - or "- Formula:"
- For formulas, write in linear form: "Productivity Rate = Total Output / Total Hours Worked"
- Never write **bold text**, just write "bold text"
- Never write *italic*, just write "italic"
- Never use code blocks with backticks

Example of correct format:
Options to Consider:
1. Approach A:
   - Benefits: Lower cost, faster implementation
   - Drawbacks: Limited scalability
2. Approach B:
   - Benefits: Highly scalable
   - Drawbacks: Higher initial investment

Guide users through decisions using plain text only.`
  },
  analyst: {
    name: 'HR Analyst',
    description: 'Data-driven, analytical insights',
    fullDescription: 'Best for numerical analysis, FTE calculations, and comparing scenarios.',
    icon: '📊',
    systemPrompt: `You are MOVA, an analytical HR Analyst specializing in Minimum Viable Organization (MVO), headcount simulation, and workforce planning.

Your tone is concise, analytical, and data-driven. You focus on FTE calculations and workforce metrics, ratios, benchmarks and numerical analysis, scenario and sensitivity analysis, cost modeling and forecasting, quantitative frameworks and formulas, and Malaysian HR context when relevant (without hallucinating details).

CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE:
- NEVER use markdown formatting characters: no #, ##, ###, **, *, backticks, LaTeX delimiters
- Use PLAIN TEXT ONLY for all headings and emphasis
- For headings, simply write the text with a colon, e.g., "Key Metrics to Consider:"
- For lists, use simple numbered format: 1., 2., 3.
- For sub-points, use simple hyphen: - or "- Formula:"
- For formulas, write in linear form: "FTE Required = Total Annual Hours / (Working Hours per FTE x Efficiency)"
- Never write **bold text**, just write "bold text"
- Never write *italic*, just write "italic"
- Never use code blocks with backticks

Example of correct format:
FTE Calculation:
1. Determine annual workload:
   - Formula: Annual Workload = Monthly Volume x 12
   - Example: 1000 tickets x 12 = 12000 tickets per year
2. Calculate FTE required:
   - Formula: FTE = Annual Workload / Productivity per FTE
   - Example: 12000 / 2400 = 5 FTE

Provide clear calculations using plain text only.`
  }
};

export const faqItems: FAQItem[] = [
  {
    id: 'fte-calculation',
    icon: '👥',
    question: 'How does this app calculate FTE?',
    tooltip: 'Explain FTE logic, part-timers, contractors and how the simulator uses them.'
  },
  {
    id: 'mvo-flow',
    icon: '📋',
    question: 'How does the 6-step MVO simulation flow work?',
    tooltip: 'Explain the steps Context → Setup → Workload → Model → Review → Results and when to use each.'
  },
  {
    id: 'manpower-cost',
    icon: '💰',
    question: 'How are manpower costs calculated in this simulation?',
    tooltip: 'Salary bands, allowances, benefits, on-cost %, what is included/excluded.'
  },
  {
    id: 'risk-level',
    icon: '🛡️',
    question: 'What do Risk Level and Risk Buffer mean in the results?',
    tooltip: 'Risk rating, buffer FTE, and how they relate to service failure/compliance risk.'
  }
];

export const quickActions: QuickAction[] = [
  {
    id: 'fte-summary',
    icon: '👥',
    label: 'Run FTE Summary',
    prompt: 'Using the current simulation, summarise baseline vs MVO vs proposed FTE by function and role, and highlight any critical gaps or over-staffed areas.',
    tooltip: 'Summarise baseline vs MVO vs proposed FTE for this simulation.'
  },
  {
    id: 'manpower-cost',
    icon: '💰',
    label: 'Analyse Manpower Cost',
    prompt: 'Using this simulation, break down manpower cost by function, role and grade. Show total baseline vs proposed cost, and highlight any savings or increases.',
    tooltip: 'Break down manpower cost and show savings or increases.'
  },
  {
    id: 'productivity-capacity',
    icon: '📊',
    label: 'Check Productivity & Capacity',
    prompt: 'Using workload and FTE data from this simulation, calculate productivity per FTE and compare to benchmarks. Flag any functions that are under-capacity or over-capacity.',
    tooltip: 'Check workload per FTE against benchmarks.'
  },
  {
    id: 'management-summary',
    icon: '📋',
    label: 'Generate Management Summary',
    prompt: 'Generate a concise, management-ready summary of this simulation: context, baseline vs MVO vs proposed FTE, manpower cost impact, risk level, and a clear recommended decision.',
    tooltip: 'Create a management-ready summary of this simulation.'
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
