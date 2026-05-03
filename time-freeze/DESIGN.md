# Design — Time Freeze

## Style Prompt

Cinematic short-film aesthetic, shot-on-Arri palette. Warm golden-hour daylight on a city sidewalk with deep cyan shadow side. Ultra-realistic illustrated look: layered depth of field, hard shadows, shimmering air, visible dust particles, subtle film grain, widescreen 2.39:1 matte bars. Premium, dramatic, slightly surreal — a man snaps his fingers and time stops.

## Colors

- `#F5E6C8` — warm highlight (sunlight, skin-tone key)
- `#E7A85A` — golden daylight accent (sunlit buildings)
- `#1E2A3A` — deep cyan shadow
- `#0A0E14` — near-black (jacket, letterbox)
- `#E8F4FF` — shockwave core (cold white refraction)
- `#FF6B3D` — ember / cigarette tip
- `#C9D6E2` — smoke highlight
- `#7E8C9E` — frozen-particle shimmer

## Typography

- `"Playfair Display", serif` — title card and timestamps (editorial weight)
- `"Inter", sans-serif` — micro captions / scene markers

## Motion

- Long easings (`power3.inOut`, `sine.inOut`) for the freeze moment
- `expo.out` for the shockwave burst
- `power4.in` for the snap
- Hyperlapse uses fast `linear` streaks with 0.08-0.14s cycles

## What NOT to Do

- No flat neon gradients
- No Roboto / generic sans-serif
- No cartoon-bright colors — keep it cinematic and desaturated
- No animating video element dimensions — wrap first
- No `repeat: -1` — hyperlapse uses finite calculated repeats
