export function sanitizeStyle(style: any): any {
  if (!style || typeof style !== 'object') return style;
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(style)) {
    if (typeof v === 'string') {
      if (/^-?\d+(\.\d+)?px$/.test(v)) {
        clean[k] = parseFloat(v);
      } else if (
        /^-?\d+(\.\d+)?$/.test(v) &&
        k !== 'fontWeight' &&
        k !== 'color' &&
        k !== 'textAlign' &&
        k !== 'display' &&
        k !== 'position' &&
        k !== 'overflow' &&
        k !== 'flexDirection'
      ) {
        clean[k] = parseFloat(v);
      } else if (v.includes('!important')) {
        clean[k] = v.replace(/\s*!important\s*/g, '');
      } else {
        clean[k] = v;
      }
    } else {
      clean[k] = v;
    }
  }
  return clean;
}
