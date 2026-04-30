export const ROOM_DISPLAY_NAMES: Record<string, string> = {
  room_stillness: 'Find Calm',
  room_clarity: 'Find Clarity',
  room_release: 'Set It Down',
  room_connection: 'Feel Connected',
  room_growth: 'Take the Next Step',
  room_joy: "Notice What's Good",
  room_grief: 'Grief',
  room_loneliness: 'Loneliness',
};

export const ROOM_THEME_COLORS: Record<string, { bg: string; accent: string }> = {
  room_joy: { bg: '#FFFDF5', accent: '#C9A84C' },
  room_grief: { bg: '#F5F5F8', accent: '#7B84A3' },
  room_growth: { bg: '#F5FAF5', accent: '#5A8A6E' },
  room_loneliness: { bg: '#F5F5FA', accent: '#7B84A3' },
  room_clarity: { bg: '#F5F8FC', accent: '#6B8EA6' },
  room_release: { bg: '#FBF5F5', accent: '#A36B6B' },
  room_stillness: { bg: '#F8F5F8', accent: '#8A6B9A' },
  room_connection: { bg: '#F5FAF8', accent: '#5A8A7B' },
};

export const LIFE_CONTEXT_LABELS: Record<string, string> = {
  work_career: 'Work or career',
  relationships: 'A relationship',
  self: 'Yourself',
  health_energy: 'Health or energy',
  money_security: 'Money or finances',
  purpose_direction: 'Your direction',
  daily_life: 'Daily Life',
};

export const LIFE_CONTEXT_OPTIONS = [
  { id: 'work_career', label: 'Work & Career' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'self', label: 'Self' },
  { id: 'health_energy', label: 'Health & Energy' },
  { id: 'money_security', label: 'Money & Security' },
  { id: 'purpose_direction', label: 'Purpose & Direction' },
  { id: 'daily_life', label: 'Daily Life' },
];
