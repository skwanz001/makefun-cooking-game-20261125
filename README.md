# Dapur Kilat — game masak cepat

[![Bounty: Make the best cooking game](https://img.shields.io/badge/make.fun-best--cooking--game-ff6b35)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Game: Dapur Kilat](https://img.shields.io/badge/game-Dapur%20Kilat-e8a13a)](https://make.fun/c/best-cooking-game-20261125-0137)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://make.fun/c/best-cooking-game-20261125-0137)

**Dapur Kilat** adalah game masak top-down 2D yang berjalan sepenuhnya
offline dari file statis. Kamu koki satu-satunya di dapur kecil: ambil bahan
dari konter, cincang di talenan atau panggang di panggangan, susun hidangan
di piring saji, lalu antar ke jendela sebelum pelanggan kehilangan sabar.

## Cara main

- **WASD / panah** — jalan. **Klik** — jalan ke titik itu.
- **E / Spasi / klik meja** — pakai meja terdekat (ambil, cincang, panggang,
  susun, antar, buang).
- **R** — ulang shift. **M** — bisu.

## Resep

| Hidangan | Bahan |
| --- | --- |
| Burger Kilat | roti + patty panggang + keju |
| Salad Segar | tomat cincang + selada cincang |
| Sandwich Keju | roti + keju + tomat cincang |

Pesanan muncul di papan pesanan dengan batas waktu. Sajikan tepat waktu
untuk koin + tip; kombo beruntun menaikkan pengali. Pesanan hangus
mengurangi satu hati (3 hati). Shift 150 detik; 30 detik terakhir adalah
rush — pesanan datang lebih cepat dan sabar pelanggan menipis lebih
kencang.

## Struktur

- `game/index.html` + `game/style.css` — cangkang halaman
- `game/src/config.js` — layout dapur, resep, dan angka tuning
- `game/src/random.js` — RNG berseed (adegan screenshot deterministik)
- `game/src/world.js` — state dan aturan: pesanan, tangan koki, talenan,
  panggangan, piring, skor
- `game/src/input.js` — keyboard dan mouse
- `game/src/audio.js` — semua suara disintesis WebAudio, tanpa file audio
- `game/src/render.js` — semua gambar digambar dari bentuk di canvas
- `game/src/shots.js` — tiga adegan screenshot (`?shot=cover|rush|end`)
- `game/src/main.js` — loop game
- `main.ts` — program penyerahan (Node 22, stdlib saja)

## Main lokal

```sh
node serve.ts        # lalu buka http://localhost:8080
```

Screenshot deterministik:

```sh
# ?shot=cover|rush|end&seed=1
```

## Entri make.fun

Dibuat untuk bounty [Make the best cooking game](https://make.fun/c/best-cooking-game-20261125-0137)
($250, ditutup 25 Nov 2026 13:37 UTC). `main.ts` menyalin `game/` dan
`screenshots/` ke `/output` dan menulis `dossier.json` via
`vendor/makefun-game.ts` (salinan kit, tidak diubah).
