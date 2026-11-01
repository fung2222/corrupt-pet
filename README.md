# 腐核寵 / CORRUPT.PET

Evil cyberpunk Tamagotchi MVP for Cyber Hub.

**Play:** https://fung2222.github.io/corrupt-pet/

Raise a cyber pet that gets worse: feed / inject / punish / jack-in. Short care sessions, long corruption. Branch forms; can melt.

## Changelog

- **v0.1.1** — Q/chibi fun silhouettes + far cyber cityscape depth BG (Roy art-tone pass).

## MVP vertical slice (v0.1.1)

1. `CHIP_EGG` idle + tap to hatch  
2. `LARVA` silhouette + 5 meters (hunger, stability, heat, loyalty, glitch)  
3. Actions: Feed / Neglect / Inject / Jack-in / Punish  
4. First fork: **Corporate Drone** (high loyalty+stability) vs **Street Virus** (high glitch+hunger)  
5–6. Form silhouette swaps (box shoulders / barcode face / data-tie vs broken polygons / magenta veins / multi-mouth)  
7. Melt fail path + re-hatch  
8. Offline simmer via `localStorage` timestamps  

**Deferred:** Neon Idol, Black ICE Hound, Black Core apex, unlock toys/skins, monetization, Snake/tip changes, hub homepage card.

## Tech

Static GitHub Pages. Canvas + CSS + WebAudio procedural art. Locked Hub palette only. Phone-first.

## Local

Open `index.html` via any static server (ES modules):

```bash
python3 -m http.server 8080
```

## License

Code for Cyber Hub / fung2222. Palette and design locked to Hub bible.
