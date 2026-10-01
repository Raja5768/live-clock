# 24/7 Live Clock for YouTube

A clean, full-screen live clock webpage designed to run 24/7 as an **OBS Browser Source** streaming to **YouTube Live**. Pure HTML + CSS + JavaScript — no build step, no dependencies.

Pipeline: **GitHub → GitHub Pages → OBS Browser Source → YouTube Live**

---

## Features

- **Live time with seconds**, current **date + day of week**, ticking on the exact second boundary
- **12-hour / 24-hour** toggle, **any IANA timezone** (searchable list)
- **Digital, analog (smooth sweep), or both**
- **Extra timezones** on the same screen (e.g. Dallas + London + Tokyo)
- **Customizable**: font (11 Google Fonts), text sizes, text/accent colors, solid / gradient / image / video backgrounds, dim overlay
- **Branding**: LIVE badge (pulsing, custom text) + channel logo (text or image)
- **Widgets**: weather (free Open-Meteo API, no key needed) and countdown timer
- **Self-healing**: auto-reloads on script errors or if the clock ever stalls (watchdog); optional scheduled refresh
- **OBS-friendly**: every setting controllable via **URL parameters**; `clean=1` hides all UI for the stream; "Copy OBS URL" button in settings
- Lightweight (~40 KB total) — safe to run for weeks

## Quick start (local preview)

Just open `index.html` in a browser, or serve the folder:

```bash
cd live-clock
python3 -m http.server 8080
# open http://localhost:8080
```

Press **S** for settings, **F** for fullscreen, **H** to hide the UI.

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `live-clock`), public or private.
2. Upload these files to the repo root (`index.html`, `styles.css`, `app.js`, `README.md`).
   ```bash
   git init && git add . && git commit -m "Live clock"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/live-clock.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
4. After ~1 minute your clock is live at `https://YOUR-USERNAME.github.io/live-clock/`.

## Connect to OBS

1. In OBS: **Sources → + → Browser**.
2. URL: your GitHub Pages URL (configure it first in a normal browser tab, then use **Copy OBS URL** in settings — it bakes every setting into the URL and adds `clean=1`).
3. Set **Width 1920**, **Height 1080**.
4. Check **"Refresh browser when scene becomes active"** and **"Shutdown source when not visible"** (saves CPU).
5. Add the source full-screen, then **Start Streaming** to your YouTube Live stream key.

Example URL with parameters:
```
https://YOUR-USERNAME.github.io/live-clock/?tz=America%2FChicago&h12=1&mode=digital&font=Orbitron&logotext=RAJ+LIVE&clean=1
```

### URL parameters

| Param | Meaning | Example |
|---|---|---|
| `tz` | IANA timezone | `tz=America/Chicago` |
| `h12` | `1` = 12-hour, `0` = 24-hour | `h12=0` |
| `sec` / `date` / `day` | `0` hides it | `sec=0` |
| `mode` | `digital` / `analog` / `both` | `mode=both` |
| `tzlabel` | Custom label under the clock | `tzlabel=Dallas+TX` |
| `zones` | Extra zones `Label\|TZ,...` | `zones=London\|Europe/London,Tokyo\|Asia/Tokyo` |
| `font` | Font name | `font=Orbitron` |
| `tsize` / `dsize` | Time / date size (vmin) | `tsize=30` |
| `fg` / `accent` | Text / accent color | `accent=%23ff453a` |
| `bg` | `solid` / `gradient` / `image` / `video` | `bg=image` |
| `bgc` / `bgg` | Base color / gradient preset | `bgg=ocean` |
| `bgi` / `bgv` | Image / video URL | `bgi=https://…` |
| `bgo` | Dim overlay 0–0.9 | `bgo=0.5` |
| `live` / `livetext` | LIVE badge | `livetext=ON+AIR` |
| `logo` / `logotext` / `logoimg` | Logo | `logotext=MY+CHANNEL` |
| `w` / `wcity` / `wlat` / `wlon` / `tunit` | Weather widget | `w=1&wcity=Dallas&tunit=F` |
| `cd` / `cdl` / `cdt` | Countdown | `cd=1&cdl=New+Year&cdt=2027-01-01T00:00` |
| `smooth` | `0` disables animations | `smooth=0` |
| `refresh` | Auto-refresh every N hours (`0` = off) | `refresh=24` |
| `clean` | `1` hides settings gear + hints | `clean=1` |
| `theme` | Preset theme (below); other params override it | `theme=citynight` |
| `labelpos` / `datepos` | `above` / `below` time | `labelpos=above` |
| `datefmt` | `long` ("Wednesday, September 30, 2026") / `short` ("09/30/2026") | `datefmt=short` |
| `padhour` | 12h leading zero: `1` ("07") / `0` ("7") | `padhour=0` |

### Preset themes

Five one-click styles matching popular 24/7 clock streams — pick one in Settings → "Preset theme", or via `?theme=`:

| Theme | Look |
|---|---|
| `minimal` | Black, "Central Time, US" above, 12h `07:09:38 PM`, full date below |
| `citynight` | Night city skyline, letterspaced label with divider, bold `7:11:24 PM` |
| `classic24` | Black, `09/30/2026` above, huge 24h `19:09:47`, `CST` below |
| `midnight` | Deep blue gradient, Orbitron font, logo + LIVE |
| `fall` | Autumn foliage photo, warm cream text |

Ready-to-use OBS URLs (replace `<you>` with your GitHub username):
- `https://<you>.github.io/live-clock/?theme=minimal&clean=1`
- `https://<you>.github.io/live-clock/?theme=citynight&clean=1`
- `https://<you>.github.io/live-clock/?theme=classic24&clean=1`
- `https://<you>.github.io/live-clock/?theme=midnight&clean=1`
- `https://<you>.github.io/live-clock/?theme=fall&clean=1`

## Stream 24/7 from a free cloud server (no laptop needed)

Instead of leaving your own computer on, run the stream on an **Oracle Cloud free-tier VM** ($0 forever: 4 CPUs, 24 GB RAM — plenty for 1080p):

1. Sign up at **oracle.com/cloud/free** (email + phone verification; a card is required for verification only).
2. Create a Compute instance: **Ubuntu 22.04**, shape **VM.Standard.A1.Flex** with **4 OCPUs / 24 GB RAM** (look for the "Always Free" tag), add your SSH public key.
3. SSH in and run the installer from this repo:
   ```bash
   wget https://raw.githubusercontent.com/YOUR-USERNAME/live-clock/main/vps-install.sh
   sudo bash vps-install.sh
   ```
4. Paste your YouTube stream key into `/etc/clock-stream.env`:
   ```bash
   sudo nano /etc/clock-stream.env
   sudo systemctl restart clock-247
   ```
5. Check it's running: `sudo journalctl -u clock-247 -f`

The installer opens your clock page in a virtual display and streams it to YouTube at 1920×1080, 30fps. The systemd service auto-restarts on crash or reboot. To change themes later, edit `CLOCK_URL` in `/etc/clock-stream.env` (any `?theme=…&clean=1` link) and restart the service.

## Reliability notes

- The page **reloads itself** if a script error occurs or if the clock stalls for more than 15 seconds (backoff + jitter, so it never hot-loops).
- Time comes from the **streaming PC's system clock**, re-aligned to the second boundary every tick. For a 24/7 stream, leave Windows/macOS **"Set time automatically"** (internet time sync) enabled — that's what keeps it accurate to the real world.
- For multi-week runs, set **auto-refresh every 24h** in settings (or `refresh=24`) to clear any slow browser memory growth. The reload takes under a second.
- If the weather widget shows `--`, the PC lost internet — the clock itself keeps running.

## Customization without code

Open the page, press **S**, change anything, and it saves to the browser automatically. Use **Copy OBS URL** to get a link with all your choices baked in.
