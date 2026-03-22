#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LANDING_DIR="$ROOT_DIR/landing"
PARTNERS_DIR="$ROOT_DIR/partners"
LANDING_DIST_DIR="$LANDING_DIR/dist"
PARTNERS_DIST_DIR="$PARTNERS_DIR/dist"
PARTNERS_TARGET_DIR="$LANDING_DIST_DIR/partners"

for dir in "$LANDING_DIR" "$PARTNERS_DIR"; do
  if [[ ! -f "$dir/package.json" ]]; then
    echo "Missing package.json in $dir"
    exit 1
  fi
done

echo "[1/4] Building landing app..."
npm --prefix "$LANDING_DIR" run build

echo "[2/4] Building partners app..."
npm --prefix "$PARTNERS_DIR" run build

echo "[3/4] Copying partners/dist into landing/dist/partners..."
rm -rf "$PARTNERS_TARGET_DIR"
mkdir -p "$PARTNERS_TARGET_DIR"
cp -R "$PARTNERS_DIST_DIR"/. "$PARTNERS_TARGET_DIR"/

echo "[4/4] Build artifacts ready for Firebase Hosting in $LANDING_DIST_DIR"

echo "Done."

echo "To deploy manually:"
echo "  cd $ROOT_DIR && firebase deploy --only hosting"
