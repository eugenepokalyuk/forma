#!/usr/bin/env bash
# Локальная сборка release-APK (подписан debug-ключом — для установки на
# устройство, не для стора). Готовый файл кладётся в apk/ в корне проекта.
#
#   npm run build:apk            — только arm64-v8a (все современные телефоны)
#   npm run build:apk -- --all   — все архитектуры (дольше)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# JDK 17 и Android SDK из Homebrew, если не заданы в окружении.
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"

ARCH_ARGS=(-PreactNativeArchitectures=arm64-v8a)
[[ "${1:-}" == "--all" ]] && ARCH_ARGS=()

(cd "$ROOT/android" && ./gradlew assembleRelease "${ARCH_ARGS[@]}")

VERSION="$(node -p "require('$ROOT/app.json').expo.version")"
SHA="$(git -C "$ROOT" rev-parse --short HEAD)"
OUT="$ROOT/apk/forma-$VERSION-$SHA.apk"

mkdir -p "$ROOT/apk"
cp "$ROOT/android/app/build/outputs/apk/release/app-release.apk" "$OUT"
echo "APK: $OUT"

"$ROOT/scripts/check-16kb.sh" "$OUT"
