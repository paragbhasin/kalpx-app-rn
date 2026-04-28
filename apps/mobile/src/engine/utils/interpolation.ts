/**
 * Interpolates string values by replacing {{variable}} patterns with data from the state object.
 * Supports nested object access (e.g., {{user.name}}).
 */
export const interpolate = (obj: any, state: any): any => {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
      const keys = p1.trim().split('.');
      let v = state;
      for (const k of keys) {
        v = v?.[k];
      }
      return v !== undefined && v !== null ? v : '';
    });
  } else if (Array.isArray(obj)) {
    return obj.map((item) => interpolate(item, state));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      newObj[key] = interpolate(obj[key], state);
    });
    return newObj;
  }
  return obj;
};
