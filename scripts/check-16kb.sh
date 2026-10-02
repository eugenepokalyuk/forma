#!/usr/bin/env bash
# Проверка поддержки 16 КБ страниц памяти — требование Google Play для
# targetSdk 35+. Проверяет:
#   1. ELF-выравнивание LOAD-сегментов всех 64-битных .so (≥ 16 КБ);
#   2. для APK — что несжатые .so выровнены в zip по 16 КБ (zipalign -P 16).
#
#   scripts/check-16kb.sh                 — последний файл из apk/ или aab/
#   scripts/check-16kb.sh path/to/app.aab — конкретный файл
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"

FILE="${1:-$(ls -t "$ROOT"/apk/*.apk "$ROOT"/aab/*.aab 2>/dev/null | head -1)}"
[[ -f "$FILE" ]] || { echo "Нет APK/AAB для проверки" >&2; exit 1; }

# Свежайшие инструменты из SDK: readelf из NDK, zipalign из build-tools.
READELF="$(ls -d "$ANDROID_HOME"/ndk/*/toolchains/llvm/prebuilt/*/bin/llvm-readelf 2>/dev/null | sort -V | tail -1)"
ZIPALIGN="$(ls -d "$ANDROID_HOME"/build-tools/*/zipalign 2>/dev/null | sort -V | tail -1)"
[[ -x "$READELF" ]] || { echo "Не найден llvm-readelf (нужен NDK в $ANDROID_HOME)" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
unzip -q "$FILE" '*.so' -d "$TMP" 2>/dev/null || true

echo "Проверка 16 КБ: $(basename "$FILE")"
failed=0
checked=0
# 32-битные ABI (armeabi-v7a, x86) под требование не попадают.
while IFS= read -r so; do
  checked=$((checked + 1))
  # Минимальное выравнивание среди LOAD-сегментов (hex, например 0x4000).
  align=""
  for a in $("$READELF" -lW "$so" | awk '$1 == "LOAD" { print $NF }'); do
    if [[ -z "$align" ]] || (( a < align )); then align="$a"; fi
  done
  if [[ -z "$align" ]] || (( align < 0x4000 )); then
    echo "  ✗ ${so#"$TMP"/} — выравнивание $align"
    failed=1
  fi
done < <(find "$TMP" -path '*/lib/arm64-v8a/*.so' -o -path '*/lib/x86_64/*.so')

(( checked > 0 )) || echo "  64-битных .so нет — проверять нечего"

if [[ "$FILE" == *.apk ]]; then
  [[ -x "$ZIPALIGN" ]] || { echo "Не найден zipalign (нужны build-tools)" >&2; exit 1; }
  if ! "$ZIPALIGN" -c -P 16 4 "$FILE" >/dev/null; then
    echo "  ✗ .so в APK не выровнены по 16 КБ (zipalign -c -P 16)"
    failed=1
  fi
fi

if (( failed )); then
  echo "Не готово к 16 КБ страницам" >&2
  exit 1
fi
echo "  ✓ $checked .so — всё выровнено по 16 КБ"
