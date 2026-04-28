export interface RetreatsInterestPayload {
  user: number;
  type: 'retreats';
  data: {
    interests: string[];
    locations: string[];
    userCity: string;
    geolocationCity: string;
    country: string;
    timezone: string;
    latitude: number | null;
    longitude: number | null;
    duration: '3_days' | '7_days' | '10_plus_days';
    experience: 'essencial' | 'comfort' | 'premium';
    spiritualIntent: string;
  };
}
