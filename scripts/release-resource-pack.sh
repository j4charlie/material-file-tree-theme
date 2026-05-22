#!/usr/bin/env bash
set -euo pipefail

asset_name="material-icon-souce.zip"
tag="${1:-}"

if [[ -z "$tag" ]]; then
  echo "Usage: scripts/release-resource-pack.sh <release-tag>" >&2
  exit 64
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required_files=(
  "dist/material-icons.json"
  "icons/file.svg"
  "icons/folder.svg"
  "icons/folder-open.svg"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "$required_file" ]]; then
    echo "Missing required resource: $required_file" >&2
    exit 66
  fi
done

rm -f "$asset_name"
zip -qr "$asset_name" dist icons
gh release upload "$tag" "$asset_name" --clobber

echo "Uploaded $asset_name to release $tag"
