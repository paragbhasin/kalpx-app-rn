/**
 * Sanitize web CSS style values for React Native compatibility.
 * Converts "16px" → 16, strips "!important", etc.
 */
export function sanitizeStyle(style: any): any {
  if (!style || typeof style !== 'object') return style;
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(style)) {
    if (typeof v === 'string') {
      // "16px" → 16
      if (/^-?\d+(\.\d+)?px$/.test(v)) {
        clean[k] = parseFloat(v);
      }
      // "0.6" (numeric string) → 0.6 for numeric properties
      else if (/^-?\d+(\.\d+)?$/.test(v) && k !== 'fontWeight' && k !== 'color' && k !== 'textAlign' && k !== 'display' && k !== 'position' && k !== 'overflow' && k !== 'flexDirection') {
        clean[k] = parseFloat(v);
      }
      // Strip !important
      else if (v.includes('!important')) {
        clean[k] = v.replace(/\s*!important\s*/g, '');
      }
      // Skip web-only properties
      else if (k === 'textTransform' && v === 'uppercase') {
        clean[k] = 'uppercase';
      }
      else {
        clean[k] = v;
      }
    } else {
      clean[k] = v;
    }
  }
  return clean;
}
