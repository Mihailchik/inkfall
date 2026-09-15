# Inkfall

A fluid simulation that runs in the browser. Move the pointer, a finger, or your
hand in front of the camera, and ink blooms through water in plumes and
filaments. One self-contained HTML page: no build step, no framework, nothing to
install.

Live at **[inkfall.voidstudio.top](https://inkfall.voidstudio.top)** · made by
[Void Studio](https://voidstudio.top).

## What it does

The water is a real simulation, not a video or a particle effect. Every frame
the GPU solves the incompressible Navier–Stokes equations: the ink is carried by
the flow, the flow curls into vortices, and heavy ink sinks while light ink
rises.

The ink is shaded the way pigment behaves, not as glowing paint. On **night
water** a thick layer deepens into saturated colour instead of blowing out to
white. On **porcelain** the ink absorbs light on its way to a white bowl and
back, and the edge of every bloom darkens the way wet sumi does.

## Controls

| Action | Pointer and touch | Keyboard |
| --- | --- | --- |
| Release ink | move; hold to paint thicker | |
| Drop a bead | click or tap | |
| Next colour | right-click, or **Colour** | |
| Clean water, new mode and colour | **Random** | X |
| Clear the water | **Clear** | C |
| Light or dark | **Theme** | T |
| Sound, microphone | **Sound**, **Mic** | S, M |
| Hand control | **Hands** | H |
| Photo, video | **Capture** | R to record, P to pause |
| How to play | **Help** | ? |

Several fingers paint several lines at once. For five seconds after any click, key
or noticeable movement the title, the dock and the hint stay lit; then they fade
together and the brush keeps painting by itself until you act again.

### Six modes

Each one changes several physical parameters at once, and switching drops a
fresh bloom so the difference shows immediately.

| Mode | Behaviour |
| --- | --- |
| Ink | blooms, then slowly sinks |
| Silk | fine curling threads that barely sink |
| Smoke | soft and light, drifts upward |
| Oil | thick and heavy, falls fast with hard edges |
| Watercolour | pale washes that spread wide |
| Pollen | tiny grains swept into whirls |

Four sliders are left for fine tuning, and each one is labelled at both ends:
flow, brush, swirl and weight.

### Hand control

Press **Hands**, allow the camera, and hold one hand up.

| Gesture | Effect |
| --- | --- |
| point | moves the brush without ink |
| pinch | paints; a quick tap drops a bead |
| open palm | stirs the water |
| peace sign | next colour |
| hold a fist | clears the water |

The camera image is processed on your device and never uploaded.

A welcome window at start shows what you can paint with (mouse or finger, hands, voice and music,
water sounds) and turns each on in place, lists the six modes so one can be picked straight away, and
switches theme and language. It closes by itself after 30 seconds; hovering pauses the countdown and
any click inside restarts it. “Don’t show at start” is remembered; **Help** in the bar or the `?` key
opens it again, and `?tour` forces it.

The theme follows the system until it is switched by hand, and the choice is remembered from then on.

### Microphone

With the microphone on, sound takes over the brush. The autopilot and the random drops stop; the
brush stands still in silence, moves faster and lays more ink as it gets louder, low hits drop heavy
beads and high sounds scatter fine ripples. System audio from a tab works the same way.

### Capture

**Photo** saves a PNG. **Record video** shows a bar with a timer, pause and
stop, and saves MP4 in Chrome or WebM elsewhere, up to 4K, with sound when sound
is on. The recording carries the Void Studio mark in the corner; the interface
never appears in it.

## Stack

| Part | Built with |
| --- | --- |
| Simulation | WebGL2 fragment shaders over half-float textures: semi-Lagrangian advection, vorticity confinement, Jacobi pressure solve, divergence-free projection, buoyancy |
| Rendering | Beer–Lambert absorption, separate night-water and porcelain shading models |
| Hand tracking | [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) 1.0.1, hand landmarker, loaded only when **Hands** is pressed; gestures classified from 21 landmarks, pointer smoothed with a One Euro filter |
| Sound | Web Audio API, fully synthesized: underwater bed, brush swish, drops with pitch, splash and stereo position; convolution reverb |
| Capture | MediaRecorder and `canvas.captureStream` |
| Interface | plain HTML, CSS and JavaScript; English and Russian |
| Hosting | static files on Vercel, with Vercel Web Analytics (page views only, no cookies) |

Quality adapts to the device: frame time is measured and the simulation grid
steps down once if frames slow, without climbing back and forth.

## Running locally

Opening `index.html` directly works for everything except the camera and the
microphone, which browsers refuse to pages loaded over `file://`. Serve it:

```bash
python3 -m http.server 8777 --bind 127.0.0.1
```

Then open `http://localhost:8777`.

### Link parameters

| Parameter | Effect |
| --- | --- |
| `?look=silk` | start with a character: `tush`, `silk`, `smoke`, `oil`, `water`, `dust` |
| `?flow=` `?brush=` `?swirl=` `?weight=` | set a slider |
| `?ink=0`…`5` | pick a colour, `-1` for auto |
| `?theme=light` / `dark` | pick a theme |
| `?lang=ru` / `en` | pick a language |
| `?bare=1` | hide the interface, for screenshots and embedding |
| `?seed=7` | repeatable randomness |

## Tests

Gesture recognition is checked without a camera, on synthetic hands fed to the
classifier taken straight from `index.html`:

```bash
node tests/gestures.test.mjs
```

## Deploying

The repository root is the publish directory; any static host works.

```bash
npx vercel deploy --prod
```

`set-domain.mjs` writes canonical URLs, `og:image` and `sitemap.xml` for a
domain:

```bash
node set-domain.mjs https://your-domain
```

## Browser support

WebGL2 with float textures is required; the page says so plainly when it is
missing. Hand control needs a camera and a secure origin (https or localhost).
