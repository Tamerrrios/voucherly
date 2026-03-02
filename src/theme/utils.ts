import { Typography } from './typography';
import { Colors, ColorKey } from './colors';

export function withColor<T extends keyof typeof Typography>(
  style: typeof Typography[T],
  color: ColorKey,
) {
  return { ...style, color: Colors[color] };
}

// более удобный алиас
export const text = <T extends keyof typeof Typography>(
  variant: T,
  color: ColorKey,
) => ({ ...Typography[variant], color: Colors[color] });