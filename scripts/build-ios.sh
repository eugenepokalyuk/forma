#!/usr/bin/env bash
# Локальная release-сборка для iPhone (подписана Apple Development — для
# установки на свой телефон, не для стора). JS-бандл внутри, Mac не нужен.
# Ставит и запускает приложение на подключённом iPhone.
#
#   npm run build:ios               — первый подключённый iPhone
#   npm run build:ios -- <UDID>     — конкретное устройство
#
# На iPhone должен быть включён Режим разработчика.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLE_ID="$(node -p "require('$ROOT/app.json').expo.ios.bundleIdentifier")"

UDID="${1:-}"
if [[ -z "$UDID" ]]; then
  JSON="$(mktemp)"
  xcrun devicectl list devices --json-output "$JSON" >/dev/null
  UDID="$(node -e '
    const { devices } = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).result;
    const d = devices.find(
      (d) => d.hardwareProperties?.platform === "iOS" && d.connectionProperties?.pairingState === "paired",
    );
    if (d) console.log(d.hardwareProperties.udid);
  ' "$JSON")"
  rm -f "$JSON"
fi
[[ -n "$UDID" ]] || { echo "iPhone не найден — подключи и разблокируй его" >&2; exit 1; }

# -allowProvisioningUpdates: Xcode сам создаёт профиль разработки.
xcodebuild \
  -workspace "$ROOT/ios/Forma.xcworkspace" \
  -scheme Forma \
  -configuration Release \
  -destination "id=$UDID" \
  -derivedDataPath "$ROOT/ios/build/device" \
  -allowProvisioningUpdates \
  -quiet \
  build

APP="$ROOT/ios/build/device/Build/Products/Release-iphoneos/Forma.app"
xcrun devicectl device install app --device "$UDID" "$APP"
xcrun devicectl device process launch --device "$UDID" "$BUNDLE_ID"
