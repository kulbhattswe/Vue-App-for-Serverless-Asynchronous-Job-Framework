#!/bin/bash

# Optional: load AWS credentials
if [[ -f .env.aws ]]; then
  echo "🔐 Loading AWS credentials from .env.aws..."
  set -o allexport
  source .env.aws
  set +o allexport
fi

set -e

# Load .env.production (only lines with VITE_ keys)
echo "Loading environment variables from .env.production..."
set -o allexport
source .env.production
set +o allexport


echo "Building Vue app..."
npm run build

echo "Syncing to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete \
  --cache-control "max-age=31536000,immutable" \
  --region $REGION

echo "Setting no-cache for index.html..."
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "no-cache" \
  --content-type "text/html" \
  --region $REGION

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --region $REGION

echo "Local deploy complete!"
