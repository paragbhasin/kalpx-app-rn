export const MITRA_ROUTE_NAMES = [
  "Home",
  "DynamicEngine",
  "MitraEngine",
  "GuidedGrowth",
  "MitraPhilosophy",
  "MitraStart",
  "MitraIntention",
  "NewMitraHome",
  "QuickCheckin",
  "BrowseRooms",
  "RhythmHome",
] as const;

export const isMitraRouteName = (name: string): boolean =>
  (MITRA_ROUTE_NAMES as readonly string[]).includes(name);
