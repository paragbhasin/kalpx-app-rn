#!/usr/bin/env bash
# React web deploy script for kalpx-app-rn/apps/web
#
# MEDIA EXCLUDE RULE (permanent until old media cleanup is explicitly approved):
# kalpx-website and kalpx-dev-website still hold Phase B rollback copies of all
# user media. Phase D delete alert covers kalpx-media ONLY — deletions from
# kalpx-website are silent. IAM deny (KalpXMediaProtection) covers kalpx*-media/*
# only — it does NOT block deletions from kalpx-website prefixes.
# All 12 media prefix excludes below are REQUIRED on every --delete sync.

set -euo pipefail

DEPLOY_ENV="${1:-}"

if [[ "$DEPLOY_ENV" != "dev" && "$DEPLOY_ENV" != "prod" ]]; then
  echo "Usage: $0 <dev|prod>"
  exit 1
fi

# Preflight: verify all 12 protected prefixes are present in this script.
REQUIRED_EXCLUDES=(audio mantras explore_slide avatar intro_video cover_image intro_media retreat_gallery post_gallery community course_video haat)
for prefix in "${REQUIRED_EXCLUDES[@]}"; do
  if ! grep -q "exclude '${prefix}/\*'" "$0"; then
    echo "PREFLIGHT FAIL: missing --exclude '${prefix}/*' in this script — aborting"
    exit 1
  fi
done
echo "Preflight passed — all 12 protected media excludes present"

cd "$(dirname "$0")/.."

if [[ "$DEPLOY_ENV" == "dev" ]]; then
  echo "=== Building for dev ==="
  pnpm --filter @kalpx/web build:dev

  echo "=== Syncing to s3://kalpx-dev-website/ ==="
  aws s3 sync apps/web/dist/ s3://kalpx-dev-website/ --delete \
    --cache-control 'max-age=31536000,public' \
    --exclude 'index.html' --exclude '*.map' \
    --exclude 'audio/*' --exclude 'mantras/*' \
    --exclude 'explore_slide/*' --exclude 'avatar/*' --exclude 'intro_video/*' \
    --exclude 'cover_image/*' --exclude 'intro_media/*' --exclude 'retreat_gallery/*' \
    --exclude 'post_gallery/*' --exclude 'community/*' --exclude 'course_video/*' \
    --exclude 'haat/*'

  aws s3 cp apps/web/dist/index.html s3://kalpx-dev-website/index.html \
    --cache-control 'no-cache,no-store,must-revalidate'

  echo "=== Invalidating dev CloudFront (via dev EC2) ==="
  ssh -i ~/KalpXKeyPairName.pem ubuntu@18.223.217.113 \
    "aws cloudfront create-invalidation --distribution-id E3O7L2906YDFHV --paths '/*'"

elif [[ "$DEPLOY_ENV" == "prod" ]]; then
  echo "=== Building for prod ==="
  pnpm --filter @kalpx/web build

  echo "=== Syncing to s3://kalpx-website/ ==="
  aws s3 sync apps/web/dist/ s3://kalpx-website/ --delete \
    --cache-control 'max-age=31536000,public,immutable' \
    --exclude 'index.html' --exclude '*.json' --exclude '*.map' --exclude 'manifest*' \
    --exclude 'audio/*' --exclude 'mantras/*' \
    --exclude 'explore_slide/*' --exclude 'avatar/*' --exclude 'intro_video/*' \
    --exclude 'cover_image/*' --exclude 'intro_media/*' --exclude 'retreat_gallery/*' \
    --exclude 'post_gallery/*' --exclude 'community/*' --exclude 'course_video/*' \
    --exclude 'haat/*'

  aws s3 cp apps/web/dist/index.html s3://kalpx-website/index.html \
    --cache-control 'no-cache,no-store,must-revalidate'

  echo "=== Invalidating prod CloudFront (via prod EC2) ==="
  # Local IAM does not have cloudfront:CreateInvalidation on prod distribution.
  ssh -i ~/KalpXKeyPairName.pem ubuntu@18.188.152.130 \
    "aws cloudfront create-invalidation --distribution-id EHMFO7K22L3VO --paths '/*'"
fi

echo "=== Deploy complete ==="
