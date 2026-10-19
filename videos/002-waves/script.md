---
title: 'How Do Waves Work?'
slug: '002-waves'
status: animated # draft → scripted → voiced → animated → rendered → published
format: vertical # 1080×1920 — TikTok / Reels / Shorts
target_length: '1:05'
voice_provider: recorded # your own voice: one take per line in audio/lines/recorded/
vo_intro: 0.3 # no title card — the hook starts immediately
vo_gap: 0.25 # tight, short-form pacing
vo_tail: 2
---

# How Do Waves Work?

From a breeze to a barrel: simple → math → surf, in about a minute.

## Look & feel

Coastal editorial — a mid-century beach poster that moves. Flat, rounded paper-cut shapes in
terracotta, cream, apricot and sea teal; film grain; tight grotesk headlines with a serif-italic
accent; layered waves; a wave-wipe between chapters. Nothing glows, nothing is outlined.

## Retention plan

- **0–2 s hook:** motion on the very first frame (a surfer already riding) and a big editorial
  headline that opens a loop: _this wave crossed an ocean… but the water barely moved_.
- **Open loop, then pay it off** in 03 (energy vs water).
- **A new visual every 2–3 s** — every VO line has its own beat.
- **Chapters** (Birth → Energy → Math → Shore) run up the left edge: progress you can feel, and
  "it gets mathy" reads as levelling up.
- **Captions** a few words at a time, the spoken word highlighted, low in the frame (muted viewers).
- **Seamless loop:** the last shot is the first shot and the last line flows into the first.
- **No intro card, no outro card.** ~65 s.

## Hook

> This wave crossed an entire ocean to get here. And yet the water inside it has barely moved.

## 01 — hook (`scenes/01-hook.tsx`)

| Event   | VO                                             | Visuals                                                               |
| ------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| `hook`  | This wave crossed an entire ocean to get here. | Poster shot: low sun, layered swell, surfer riding; headline rises in |
| `twist` | And yet the water inside it has barely moved.  | Headline swaps; one parcel of water ringed, quietly circling in place |

## 02 — wind (`scenes/02-wind.tsx`)

| Event     | VO                                                                                     | Visuals                                                   |
| --------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `storm`   | It began days ago, in a storm thousands of kilometers away.                            | Terracotta sky, cream storm clouds drift in, rain streaks |
| `ripples` | Wind dragged across the sea and raised ripples, and every ripple gave it more to push. | Flat sea shivers into ripples                             |
| `grow`    | How big they get comes down to three things: wind speed, time, and distance.           | Swell builds; an editorial list i. ii. iii. sets in       |

## 03 — energy (`scenes/03-energy.tsx`)

| Event    | VO                                                                              | Visuals                                                       |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `energy` | But a wave isn't water on the move. It's energy.                                | Cut-away of the sea; "energy" travels along with the wave     |
| `orbit`  | Each parcel of water just turns in a circle, and lands almost where it started. | Parcels at several depths trace circles, shrinking with depth |

## 04 — math (`scenes/04-math.tsx`)

| Event   | VO                                                                                                   | Visuals                                              |
| ------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `sine`  | Strip it down and a wave is a sine curve. A height, a length, a rhythm.                              | Cream page; y = A sin(kx − ωt); A, λ, T annotated    |
| `speed` | In deep water, longer waves travel faster. Their speed grows with the square root of the wavelength. | c = √(gλ/2π) ≈ 1.25√λ; a long and a short wave race  |
| `sort`  | So the long swells outrun the chaos, and arrive in clean, orderly lines.                             | Choppy sea untangles into clean, evenly spaced swell |

## 05 — shore (`scenes/05-shore.tsx`)

| Event     | VO                                                                                | Visuals                                                  |
| --------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `shallow` | Near the coast, the seabed takes over. Now speed depends only on depth.           | Sunset; seabed slopes up under the swell; c = √(gh)      |
| `stack`   | The front slows down, the back catches up, and the wave rises.                    | Waves shorten and grow over the slope; H ∝ h^(−1/4)      |
| `break`   | Once it stands almost as tall as the water is deep, the crest overtakes its base. | One wave on the reef, H ≈ 0.8 d; crest leans and pitches |
| `barrel`  | Over a steep reef, it throws forward, and folds into a barrel.                    | Lip throws into a tube; the surfer appears inside        |

## 06 — loop (`scenes/06-loop.tsx`)

| Event  | VO                                                          | Visuals                                        |
| ------ | ----------------------------------------------------------- | ---------------------------------------------- |
| `ride` | Thousands of kilometers, for a few seconds of perfect ride. | Back to the opening shot — loops into the hook |

## Sources

- Munk, W. et al. (1963), _Directional recording of swell from distant storms_, Phil. Trans.
  R. Soc. A — swell from Southern Ocean storms tracked across the Pacific to Alaska.
- NOAA Ocean Service — _What is a wave?_ / _Waves transmit energy, not water_.
- Deep-water dispersion: c = √(gλ / 2π) ≈ 1.25 √λ m/s (λ in m); shallow water: c = √(g h).
  Any intro physical-oceanography text, e.g. Holthuijsen, _Waves in Oceanic and Coastal
  Waters_ (2007).
- Depth-limited breaking, H/d ≈ 0.78 (McCowan 1894); breaker type vs beach slope (Iribarren
  number, Battjes 1974) — steep reefs give plunging, barrelling waves.
- Wave growth with wind speed, duration and fetch — NOAA / NWS swell forecasting basics.
