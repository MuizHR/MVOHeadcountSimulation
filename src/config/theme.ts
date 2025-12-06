export const theme = {
  colors: {
    primary: '#00B781',
    primaryHover: '#00908C',
    primarySoft: '#E5FAF9',
    limeAccent: '#A3E635',
    limeSoft: '#ECFCCB',
    pageBackground: '#F5F7FB',
    cardBackground: '#FFFFFF',
    borderSubtle: '#E5E7EB',
    textMain: '#111827',
    textMuted: '#6B7280',
    textOnDark: '#FFFFFF',
    statusSuccess: '#16A34A',
    statusWarning: '#F59E0B',
    statusError: '#EF4444',
    statusInfo: '#1E7BBF',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: {
      h1: '40px',
      h2: '32px',
      h3: '20px',
      body: '16px',
      label: '14px',
      caption: '12px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    cardRadius: '16px',
    buttonRadius: '8px',
    cardPadding: '24px',
  },
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
};

export const chartColors = {
  baseline: theme.colors.statusInfo,
  proposed: theme.colors.primary,
  savings: theme.colors.limeAccent,
  positive: theme.colors.statusSuccess,
  warning: theme.colors.statusWarning,
  error: theme.colors.statusError,
  neutral: theme.colors.textMuted,
  series: [
    theme.colors.primary,
    theme.colors.limeAccent,
    theme.colors.statusInfo,
    theme.colors.statusSuccess,
    theme.colors.statusWarning,
  ],
};

export const exportColors = {
  headerBg: theme.colors.primarySoft,
  headerText: theme.colors.textMain,
  accentBar: theme.colors.primary,
  positiveValue: theme.colors.limeAccent,
  negativeValue: theme.colors.statusError,
  bodyText: theme.colors.textMain,
  mutedText: theme.colors.textMuted,
  borderColor: theme.colors.borderSubtle,
};
