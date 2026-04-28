export interface WhyThisContent {
  level1: string;
  level2: string;
  level3: string;
  hasContent: boolean;
}

export function extractWhyThis(screenData?: Record<string, any>): WhyThisContent {
  const wt = screenData?.why_this ?? {};
  const level1 = typeof wt.level1 === "string" ? wt.level1 : "";
  const level2 = typeof wt.level2 === "string" ? wt.level2 : "";
  const level3 = typeof wt.level3 === "string" ? wt.level3 : "";
  return { level1, level2, level3, hasContent: !!(level1 || level2 || level3) };
}
