
export const Font = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semibold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
} as const;

export const Typography = {
  title: {
    fontFamily: Font.bold,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  buttonText: {
    fontFamily: Font.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
};