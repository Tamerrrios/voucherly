export const Colors = {
  textPrimary: '#222',
  textSecondary: '#666',
  textLight: '#fff',
  brand: '#E53935',
  error: '#D32F2F',
  success: '#388E3C',
  white: 'white'
} as const;

export type ColorKey = keyof typeof Colors;