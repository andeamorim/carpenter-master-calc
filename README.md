# Carpenter Master Calc

Professional construction calculator for US carpenters — feet-inch-fraction math, rafters, stairs, framing, and more.

**Live (web):** https://carpenter-master-calc.vercel.app

## Quick start

```bash
npm install
npm start        # Expo dev server
npm run web      # Browser
```

## Verify before shipping

```bash
npm run verify-math && npm run verify-input && npm run verify-chain && npm run verify-store && npm run typecheck
```

## Project handoff

**AI / new developers:** read [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) first. It documents architecture, fixed bugs, user preferences, and the roadmap.

## Stack

- Expo 56 + React Native + Expo Router
- Zustand (state)
- Vercel (web deploy)
- Target: iOS + Android via EAS (not fully configured yet)

## License

See [LICENSE](./LICENSE).