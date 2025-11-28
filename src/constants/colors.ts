// Color palette - bright, gentle, modern colors
export const COLORS = {
  // Primary gradients
  gradients: {
    primary: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    income: 'linear-gradient(135deg, #81FBB8 0%, #28C76F 100%)',
    expense: 'linear-gradient(135deg, #FFB4B4 0%, #EA5455 100%)',
    balancePositive: 'linear-gradient(135deg, #89CFF0 0%, #4FC3F7 100%)',
    balanceNegative: 'linear-gradient(135deg, #FFD93D 0%, #FFA726 100%)',
    sidebar: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
  },
  
  // Solid colors
  income: {
    light: '#81FBB8',
    main: '#28C76F',
    dark: '#1ea55a',
  },
  
  expense: {
    light: '#FFB4B4',
    main: '#EA5455',
    dark: '#d43d3e',
  },
  
  balance: {
    positiveLight: '#89CFF0',
    positiveMain: '#4FC3F7',
    negativeLight: '#FFD93D',
    negativeMain: '#FFA726',
  },
  
  // Text colors
  text: {
    primary: '#1a202c',
    secondary: '#2d3748',
    tertiary: '#4a5568',
    quaternary: '#718096',
  },
  
  // Background colors
  background: {
    main: '#f8f9fa',
    paper: '#ffffff',
    hover: 'rgba(129, 251, 184, 0.15)',
    border: '#dee2e6',
  },
  
  // Shadow colors
  shadows: {
    primary: 'rgba(31, 38, 135, 0.15)',
    income: 'rgba(40, 199, 111, 0.25)',
    expense: 'rgba(234, 84, 85, 0.25)',
    balancePositive: 'rgba(79, 195, 247, 0.25)',
    balanceNegative: 'rgba(255, 167, 38, 0.25)',
    card: 'rgba(0, 0, 0, 0.08)',
  },
};

// Box shadow utilities
export const BOX_SHADOWS = {
  card: `0 8px 32px ${COLORS.shadows.primary}`,
  cardHover: `0 12px 48px ${COLORS.shadows.primary}`,
  income: `0 8px 32px ${COLORS.shadows.income}`,
  incomeHover: `0 12px 48px ${COLORS.shadows.income}`,
  expense: `0 8px 32px ${COLORS.shadows.expense}`,
  expenseHover: `0 12px 48px ${COLORS.shadows.expense}`,
  balancePositive: `0 8px 32px ${COLORS.shadows.balancePositive}`,
  balancePositiveHover: `0 12px 48px ${COLORS.shadows.balancePositive}`,
  balanceNegative: `0 8px 32px ${COLORS.shadows.balanceNegative}`,
  balanceNegativeHover: `0 12px 48px ${COLORS.shadows.balanceNegative}`,
  small: `0 2px 8px ${COLORS.shadows.card}`,
  medium: `0 4px 12px ${COLORS.shadows.card}`,
};
