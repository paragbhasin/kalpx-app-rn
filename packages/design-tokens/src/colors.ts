export const Colors = {
  // Primary gold accents
  gold: '#C9A84C',
  goldBright: '#D4A017',
  goldHairline: 'rgba(212, 160, 23, 0.25)',
  goldPale: '#F7EED1',
  goldPaleEnd: '#E8D9A8',

  // Browns — headlines and body text
  brownDeep: '#432104',
  brownMuted: '#8A7D6B',
  textSoft: '#6B6155',
  textFaint: '#999999',

  // Backgrounds
  parchment: '#FAF7F2',
  cream: '#FFFDF7',
  creamWarm: '#FFFDF5',

  // Semantic
  successGreen: '#10B981',
  ringTan: '#BFA58A',

  // Soft supports
  lotusPeach: '#F5EDEA',
  lotusPeachEdge: '#E5D4CA',

  // Misc retained for migration; prefer semantic names above
  borderCream: '#EDE1D3',
} as const;

export type ColorToken = keyof typeof Colors;

export const color = (token: ColorToken): string => Colors[token];
