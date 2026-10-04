#!/usr/bin/env bash
# Локальная сборка release-AAB для Google Play, подписанного upload-ключом.
# Готовый файл кладётся в aab/ в корне проекта.
#
#   npm run build:aab                      — versionCode = число коммитов в HEAD
#   npm run build:aab -- --version-code 42 — свой versionCode
#
# Upload-ключ — в ~/.gradle/gradle.properties (не в репозитории):
#   FORMA_UPLOAD_STORE_FILE=/абсолютный/путь/forma-upload.jks
#   FORMA_UPLOAD_STORE_PASSWORD=...
#   FORMA_UPLOAD_KEY_ALIAS=forma-upload
#   FORMA_UPLOAD_KEY_PASSWORD=...
# Создать ключ:
#   keytool -genkeypair -v -storetype JKS -keyalg RSA -keysize 2048 \
#     -validity 10000 -keystore forma-upload.jks -alias forma-upload
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# JDK 17 и Android SDK из Homebrew, если не заданы в окружении.
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"

# AAB с debug-подписью Play не примет — без upload-ключа не собираем.
GRADLE_PROPS="${GRADLE_USER_HOME:-$HOME/.gradle}/gradle.properties"
if [[ -z "${ORG_GRADLE_PROJECT_FORMA_UPLOAD_STORE_FILE:-}" ]] &&
  ! grep -qs '^FORMA_UPLOAD_STORE_FILE=' "$GRADLE_PROPS"; then
  echo "Нет upload-ключа: добавьте FORMA_UPLOAD_* в $GRADLE_PROPS (см. шапку скрипта)" >&2
  exit 1
fi

# Число коммитов только растёт на main — годится как versionCode по умолчанию.
VERSION_CODE="$(git -C "$ROOT" rev-list --count HEAD)"
if [[ "${1:-}" == "--version-code" ]]; then
  VERSION_CODE="${2:?укажите versionCode}"
fi

# Манифест ассетов expo-updates (app.manifest) Gradle не пересобирает: у задачи
# createReleaseUpdatesResources нет файловых входов, и после первой сборки она
# всегда «up-to-date». Без пересборки новые картинки из assets/ на Android
# получают пустой uri и не показываются. Удаляем выход — задача перегенерирует.
rm -rf "$ROOT/android/app/build/generated/assets/createReleaseUpdatesResources"

(cd "$ROOT/android" && ./gradlew bundleRelease -PformaVersionCode="$VERSION_CODE")

VERSION="$(node -p "require('$ROOT/app.json').expo.version")"
SHA="$(git -C "$ROOT" rev-parse --short HEAD)"
OUT="$ROOT/aab/forma-$VERSION-$VERSION_CODE-$SHA.aab"

mkdir -p "$ROOT/aab"
cp "$ROOT/android/app/build/outputs/bundle/release/app-release.aab" "$OUT"
echo "AAB: $OUT (versionCode $VERSION_CODE)"

"$ROOT/scripts/check-16kb.sh" "$OUT"
