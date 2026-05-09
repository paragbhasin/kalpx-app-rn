# Feature Flags & Environment Configuration

The canonical KalpX/Mitra feature flag and environment configuration guide lives in the backend repo:

**`KalpX/docs/feature-flags-and-env.md`**

All web/mobile developers must follow that document before adding or changing:
- `VITE_*` variables
- `EXPO_PUBLIC_*` variables
- `WEB_ENV` fields (`apps/web/src/lib/env.ts`)
- `packages/core` env readers
- EAS env/profile values (`apps/mobile/eas.json`)
- deployment-time flags

## Golden Rule

No new environment variable or feature flag can be merged unless it is:

1. Documented in the canonical guide (`KalpX/docs/feature-flags-and-env.md`)
2. Added to the relevant `.env.example` file in this repo (`apps/web/.env.example` or `apps/mobile/.env.example`)
3. Added to `WEB_ENV` / `packages/core` env readers where applicable
4. Included in deployment notes if it affects build or runtime behavior

## Quick References

- Web env vars → `apps/web/src/lib/env.ts` (`WEB_ENV` object)
- Mobile env vars → `packages/core/src/env.ts`
- Web example → `apps/web/.env.example`
- Mobile example → `apps/mobile/.env.example`
- EAS build profiles → `apps/mobile/eas.json`
