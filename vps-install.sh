#!/usr/bin/env bash
#
# vps-install.sh — turn a fresh Debian/Ubuntu VPS into a 24/7 YouTube live-clock streamer.
#
# What it does:
#   1. Installs Google Chrome, FFmpeg, and Xvfb (virtual display).
#   2. Installs /usr/local/bin/clock-247.sh — opens your clock page in Chrome
#      and streams the screen to YouTube via RTMP, 1920x1080 @ 30fps.
#   3. Creates a systemd service (clock-247) that auto-restarts on crash/reboot.
#
# Usage (as root or with sudo):
#   sudo bash vps-install.sh
#
# The script will ask for your YouTube stream key and which clock theme URL to stream.
# Find the key in YouTube Studio → Create → Go live → Stream settings.
# Enable live streaming at least 24 hours before your first stream (YouTube rule
# for new accounts) and verify your phone number when asked.
#
# Recommended server: 2 vCPU / 4 GB RAM (e.g. Hetzner CX22 ~$5/mo).
# A 1 vCPU box can work at 720p — edit clock-247.sh (VIDEO_SIZE/FRAMERATE) if needed.
#
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Please run as root: sudo bash $0" >&2
  exit 1
fi

echo "==> Installing packages (chrome, ffmpeg, xvfb)…"
apt-get update -qq
apt-get install -y -qq wget gnupg xvfb ffmpeg >/dev/null

if ! command -v google-chrome-stable >/dev/null 2>&1; then
  echo "==> Installing Google Chrome…"
  ARCH="$(dpkg --print-architecture)"
  case "$ARCH" in
    amd64) CHROME_URL="https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb" ;;
    arm64) CHROME_URL="https://dl.google.com/linux/direct/google-chrome-stable_current_arm64.deb" ;;
    *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
  esac
  wget -q -O /tmp/chrome.deb "$CHROME_URL"
  apt-get install -y -qq /tmp/chrome.deb >/dev/null || apt-get install -f -y -qq >/dev/null
  rm -f /tmp/chrome.deb
fi

echo "==> Writing /usr/local/bin/clock-247.sh…"
cat > /usr/local/bin/clock-247.sh <<'STREAMER'
#!/usr/bin/env bash
# Opens the clock page and streams the virtual display to YouTube. Relies on:
#   CLOCK_URL     full https URL of the clock page (with ?theme=…&clean=1)
#   YT_STREAM_KEY YouTube stream key (YouTube Studio → Go live → Stream)
#   RTMP          ingest server (default: rtmp://a.rtmp.youtube.com/live2)
set -euo pipefail

: "${CLOCK_URL:?CLOCK_URL is not set}"
: "${YT_STREAM_KEY:?YT_STREAM_KEY is not set}"
RTMP="${RTMP:-rtmp://a.rtmp.youtube.com/live2}"

export DISPLAY=:99
# Clean up any leftovers from a previous run
pkill -f "Xvfb :99" 2>/dev/null || true
pkill -f "chrome.*--app=" 2>/dev/null || true
sleep 1

Xvfb :99 -screen 0 1920x1080x24 >/tmp/xvfb.log 2>&1 &
sleep 2

google-chrome-stable --kiosk --no-sandbox --disable-dev-shm-usage \
  --disable-features=Translate --window-size=1920,1080 \
  --app="$CLOCK_URL" >/tmp/chrome.log 2>&1 &
# Give the page time to load before FFmpeg starts grabbing
sleep 12

# If the key looks like a placeholder, fail fast instead of streaming nowhere.
if [[ "$YT_STREAM_KEY" == PASTE-* ]]; then
  echo "YT_STREAM_KEY is still a placeholder — edit /etc/clock-stream.env" >&2
  exit 1
fi

exec ffmpeg -hide_banner -loglevel warning \
  -f x11grab -video_size 1920x1080 -framerate 30 -i :99 \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -c:v libx264 -preset veryfast -tune zerolatency -pix_fmt yuv420p \
  -b:v 4000k -maxrate 4000k -bufsize 8000k -g 60 -keyint_min 60 \
  -c:a aac -b:a 128k -ar 44100 \
  -f flv "$RTMP/$YT_STREAM_KEY"
STREAMER
chmod +x /usr/local/bin/clock-247.sh

echo "==> Writing systemd service…"
cat > /etc/systemd/system/clock-247.service <<'UNIT'
[Unit]
Description=24/7 YouTube live clock stream
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
EnvironmentFile=/etc/clock-stream.env
ExecStart=/usr/local/bin/clock-247.sh
Restart=always
RestartSec=15

[Install]
WantedBy=multi-user.target
UNIT

if [[ ! -f /etc/clock-stream.env ]]; then
  echo "==> Creating /etc/clock-stream.env (edit it with your real values)…"
  cat > /etc/clock-stream.env <<'ENV'
# Paste your YouTube stream key here (YouTube Studio → Create → Go live → Stream).
# Keep this file private: it is readable only by root.
YT_STREAM_KEY=PASTE-YOUR-STREAM-KEY-HERE
# Which clock to stream — any ?theme=…&clean=1 link works:
#   minimal, citynight, classic24, midnight, fall
CLOCK_URL=https://raja5768.github.io/live-clock/?theme=citynight&clean=1
ENV
  chmod 600 /etc/clock-stream.env
fi

systemctl daemon-reload
systemctl enable --now clock-247.service >/dev/null

echo ""
echo "================================================================"
echo " Installed. Now:"
echo "  1. Edit /etc/clock-stream.env and paste your YouTube stream key:"
echo "       sudo nano /etc/clock-stream.env"
echo "  2. Restart the service:"
echo "       sudo systemctl restart clock-247"
echo "  3. Watch the logs:"
echo "       sudo journalctl -u clock-247 -f"
echo ""
echo " To change the theme later, edit CLOCK_URL in /etc/clock-stream.env"
echo " and restart the service. To stop: sudo systemctl stop clock-247"
echo "================================================================"
