import type { Config } from 'tailwindcss';
import { MitraPalette } from '@kalpx/design-tokens';
import { Colors } from '@kalpx/design-tokens';
import { spacing } from '@kalpx/design-tokens';
import { radius } from '@kalpx/design-tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mitra: MitraPalette,
        brand: Colors,
      },
      spacing: spacing as any,
      borderRadius: radius as any,
    },
  },
} satisfies Config;
