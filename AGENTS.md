# Agent instructions

**Read [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) before making changes.** It contains full project context, bug history, and roadmap.

## Expo version

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing Expo-specific code.

## Critical rules

1. Run `npm run verify-store` (and other `verify-*` scripts) after changes to `calculator.ts` or `dimensional.ts`.
2. Default fraction rounding is **1/16"** (`fractionResolution: 16`).
3. `in-frac` display mode shows **total inches**, not feet+inches.
4. Do not remove memory/tape/quick-fraction buttons from the main calculator without explicit user request.
5. Internal math precision is **1/64"**; display rounding is user-configurable.

## Key files

| File | Purpose |
|------|---------|
| `src/store/calculator.ts` | Main calculator state machine |
| `src/engine/dimensional.ts` | Imperial math engine |
| `src/hooks/useResponsive.ts` | Responsive breakpoints |
| `PROJECT_MEMORY.md` | Full handoff documentation |