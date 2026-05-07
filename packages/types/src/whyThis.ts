/**
 * Dashboard Why-This curated intelligence types.
 * Stage 1: MITRA_CURATED_DASHBOARD_WHY_THIS
 */

export type WhyThisScope = 'path' | 'today' | 'now' | 'item' | 'legacy' | 'none';

export interface DashboardWhyThis {
  explanation_id?: string | null;
  condition_key?: string | null;
  explanation_scope?: WhyThisScope | null;
  label?: string | null;
  selection_source?: string | null;
  relevance_status?: string | null;
  show_path_items?: boolean | null;
  item_specific_lines?: Record<string, string> | null;
  guidance_mode?: string | null;
  freshness_group?: string | null;
  semantic_family?: string | null;
  level1?: string | null;
  level2?: string | null;
  level3?: string | null;
  /** Legacy path only — principle_id used by getPrinciple() API. */
  principle_id?: string | null;
}
