# LineProof demo video (Remotion)

Code-driven 1920×1080 demo, ~2:15, nine scenes with fade transitions. Mirrors the
live dashboard palette; the on-chain proof scene shows the real attestation memo
and signature.

```bash
npm install
npm run studio     # preview at localhost:3000
npm run render     # -> out/lineproof-demo.mp4 (h264, crf 18, bt709)
```

Scenes live in `src/scenes.tsx`, sequencing in `src/Root.tsx`, shared components
in `src/ui.tsx`, palette in `src/theme.ts`.
