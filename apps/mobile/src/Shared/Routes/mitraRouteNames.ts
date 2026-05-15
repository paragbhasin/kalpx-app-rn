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
  "RhythmSetup",
  "RhythmEdit",
  "InnerPath",
  "QuickReset",
  "TellMitra",
] as const;

export const isMitraRouteName = (name: string): boolean =>
  (MITRA_ROUTE_NAMES as readonly string[]).includes(name);
