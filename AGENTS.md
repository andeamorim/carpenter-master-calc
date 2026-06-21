# Agent instructions

**Read [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) before making changes.** It contains full project context, UX rules, behavior matrix, bug history, and roadmap.

## Expo version

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing Expo-specific code.

## Critical rules

1. Run `npm run verify-all` after changes to `calculator.ts` or `dimensional.ts`.
2. Default fraction rounding is **1/16"** (`fractionResolution: 16`).
3. `in-frac` display mode shows **total inches**, not feet+inches.
4. **Do not reintroduce** memory, tape, ±, or separate `′`/`″` keys without explicit user request.
5. Unit toggle is **only** on the display (INCH | FEET) — not on the keypad.
6. Internal math precision is **1/64"**; display rounding is user-configurable.
7. In FEET mode: digits = feet; `.` starts inch entry (`3.6` = 3'6"); fractions disabled until `.`.
8. In INCH mode: `.` is disabled; fractions always enabled.
9. AC preserves `inputUnit`; CE preserves chain + `inputUnit`.

## Key files

| File | Purpose |
|------|---------|
| `app/index.tsx` | Calculator UI (keypad, disabled states) |
| `src/store/calculator.ts` | Main calculator state machine |
| `src/components/Display.tsx` | Display + INCH/FEET toggle |
| `src/engine/dimensional.ts` | Imperial math engine |
| `scripts/verify-calculator-behavior.ts` | Full behavior test matrix |
| `PROJECT_MEMORY.md` | Full handoff documentation |

## Deploy

```bash
npm run verify-all && npm run typecheck
npx vercel --prod --yes
```