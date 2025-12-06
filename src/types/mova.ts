export type MOVAPersona = 'expert' | 'advisor' | 'analyst';

export type QuickActionType =
  | 'fte-summary'
  | 'manpower-cost'
  | 'productivity-capacity'
  | 'management-summary';

export interface MOVAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isDashboardPreview?: boolean;
  dashboardData?: DashboardPreviewData;
}

export interface DashboardPreviewData {
  totalFTE: number;
  monthlyCost: number;
  automationPotential: number;
  riskBuffer: 'low' | 'medium' | 'high';
}

export interface MOVAState {
  isOpen: boolean;
  isDarkMode: boolean;
  persona: MOVAPersona;
  messages: MOVAMessage[];
  isThinking: boolean;
  position: { x: number; y: number };
  hasCompletedOnboarding: boolean;
  showWhatsNew: boolean;
  isQuickActionsExpanded: boolean;
  showFAQ: boolean;
  sessionContext: SessionContext;
}

export interface SessionContext {
  fteValues: Record<string, number>;
  workloadUnits: Record<string, number>;
  costParameters: Record<string, number>;
  projectContext: string;
  usedQuickActions: QuickActionType[];
  usedFAQs: string[];
}

export interface MOVAContextType {
  state: MOVAState;
  toggleOpen: () => void;
  toggleDarkMode: () => void;
  setPersona: (persona: MOVAPersona) => void;
  sendMessage: (content: string, isDashboardPreview?: boolean, dashboardData?: DashboardPreviewData) => Promise<void>;
  resetConversation: () => void;
  setPosition: (x: number, y: number) => void;
  completeOnboarding: () => void;
  toggleWhatsNew: () => void;
  toggleQuickActions: () => void;
  handleQuickAction: (action: QuickActionType) => Promise<void>;
  handleFAQ: (question: string) => Promise<void>;
  trackAnalytics: (event: string, data?: any) => void;
  updateSessionContext: (key: keyof SessionContext, value: any) => void;
}

export interface PersonaConfig {
  name: string;
  description: string;
  fullDescription: string;
  systemPrompt: string;
  icon: string;
}

export interface FAQItem {
  id: string;
  icon: string;
  question: string;
  tooltip: string;
}

export interface QuickAction {
  id: QuickActionType;
  icon: string;
  label: string;
  prompt: string;
  tooltip: string;
}

export interface AnalyticsEvent {
  event: string;
  timestamp: Date;
  data?: any;
}
