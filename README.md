# Inkfall

A GPU fluid simulation that runs in the browser. Move the pointer and ink blooms
through water in plumes and filaments. One self-contained HTML page: no build
step, no dependencies, no framework.

## What is inside

The velocity field solves the incompressible Navier-Stokes equations on the GPU:
advection, vorticity confinement, a Jacobi pressure solve and a divergence-free
projection, all as fragment shaders over ping-ponged float textures.

The pigment is not drawn as glowing paint. It is shaded by Beer-Lambert
absorption, so a thick layer deepens into a saturated colour instead of blowing
out to white, and it is heavier than water, so it sinks and rolls into
mushrooming plumes.

- **Six ink characters** — ink, silk, smoke, oil, watercolour, pollen — plus
  sliders for speed, density, thickness, fibres, sharpness, weight, vorticity
  and spread.
- **Adaptive quality.** Frame time is measured every few seconds and the
  simulation grid moves between 768 and 3072 to hold a smooth frame rate.
- **Synthesized sound.** No audio files: an underwater bed, brush swish that
  follows pointer speed, and drops whose pitch, splash and stereo position
  depend on their size and place on screen.
- **Microphone and system audio.** Low sounds drop fat beads, high ones scatter
  fine ripples.
- **Capture.** PNG stills and video up to 4K, MP4 in Chrome and WebM elsewhere.
- **English and Russian**, switchable in the settings panel.

## Running it

Open `index.html` in a browser. That works for everything except the
microphone: browsers deny device access to pages loaded over `file://`. For the
full thing, serve it:

```bash
python3 -m http.server 8777 --bind 127.0.0.1
```

Then open `http://localhost:8777`. Add `?lang=ru` for Russian, or `?bare=1` to
hide the interface.

## Deploying

The whole thing is static. Any host works; the repository root is the publish
directory.

```bash
npx vercel deploy --prod          # Vercel
npx netlify deploy --prod --dir . # Netlify
npx wrangler pages deploy .       # Cloudflare Pages
```

For GitHub Pages, enable Pages in the repository settings and pick the `main`
branch with the `/` root.

Once a domain exists, run this once to fill in canonical URLs, `og:image` and a
sitemap:

```bash
node set-domain.mjs https://your-domain
```

## Preview image

`og.jpg` is captured from the scene itself:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --enable-unsafe-swiftshader --window-size=1200,630 --virtual-time-budget=6200 \
  --screenshot=og-raw.png "http://localhost:8777/?bare=1"
ffmpeg -y -i og-raw.png -q:v 3 og.jpg && rm og-raw.png
```

The `--virtual-time-budget` value decides how far the ink has spread.

## Analytics

Vercel Web Analytics is wired in: page views only, no cookies, no personal data,
and it does not load on localhost. Enable it in the Vercel project settings, or
swap the snippet in `<head>` for another counter.

## Browser support

WebGL2 with float textures is required; the page says so plainly when it is
missing. Video capture uses MediaRecorder. Converting WebM to MP4:

```bash
ffmpeg -i input.webm -c:v libx264 -crf 18 -pix_fmt yuv420p output.mp4
```
