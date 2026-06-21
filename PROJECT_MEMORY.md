# Carpenter Master Calc — Memória do Projeto

> **Última atualização:** 2026-06-20  
> **Tag de referência:** `v1.1.0-behavior-verified`
> **Propósito deste arquivo:** Handoff para qualquer AI ou dev que continue o projeto. Leia isto antes de tocar no código.

---

## 1. O que é o app

**Carpenter Master Calc** é uma calculadora profissional para carpinteiros nos EUA (sistema imperial: pés, polegadas, frações). Concorrente direto do **Construction Master Pro Calc** (~$4.99/mês).

| Item | Valor |
|------|-------|
| Stack | React Native + Expo 56 + Expo Router + Zustand |
| Plataformas alvo | iOS, Android, Web |
| Web live | https://carpenter-master-calc.vercel.app |
| Conta Vercel | `wwwander-9422` / projeto `carpenter-master-calc` |
| GitHub | `andeamorim/carpenter-master-calc` |
| Assinatura | $4.99/mês, trial 14 dias (simulado localmente) |
| Idioma do produto | Inglês (mercado US) |
| Idioma do dev/user | Português |

---

## 2. Estrutura de pastas

```
carpenter-master-calc/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Calculadora principal
│   │   ├── ez-calcs.tsx       # Lista de calculadoras guiadas
│   │   ├── projects.tsx       # Placeholder Phase 2
│   │   ├── settings.tsx       # Precisão, modo display, dark mode
│   │   └── _layout.tsx        # Tab bar responsiva
│   ├── calculators/           # Stack de EZ Calcs
│   │   ├── right-angle.tsx
│   │   ├── rafter.tsx
│   │   ├── stairs.tsx
│   │   ├── studs.tsx
│   │   ├── roofing.tsx
│   │   ├── board-feet.tsx     # PRO
│   │   ├── drywall.tsx        # PRO
│   │   └── compound-miter.tsx # PRO
│   ├── paywall.tsx
│   ├── +html.tsx              # Viewport web
│   └── _layout.tsx
├── src/
│   ├── engine/
│   │   ├── dimensional.ts     # ⭐ Motor matemático central
│   │   ├── right-angle.ts
│   │   ├── rafter.ts
│   │   ├── stairs.ts
│   │   ├── framing.ts
│   │   └── roofing.ts
│   ├── store/
│   │   ├── calculator.ts      # ⭐ Estado da calculadora principal
│   │   ├── settings.ts
│   │   ├── subscription.ts
│   │   └── tape.ts
│   ├── hooks/
│   │   ├── useResponsive.ts   # Breakpoints responsivos
│   │   └── useTheme.ts
│   ├── components/
│   │   ├── CalcButton.tsx
│   │   ├── Display.tsx
│   │   ├── ScreenContainer.tsx
│   │   ├── CalcFormLayout.tsx
│   │   ├── DimensionalInput.tsx
│   │   └── ResultRow.tsx
│   └── data/ez-calcs.ts
├── scripts/
│   ├── test-helpers.ts
│   ├── verify-math.ts
│   ├── verify-calculator-input.ts
│   ├── verify-calculator-chain.ts
│   ├── verify-calculator-store.ts
│   ├── verify-calculator-sequential.ts
│   ├── verify-calculator-behavior.ts
│   └── verify-calculator-sequential-edge.ts
├── vercel.json
├── eas.json                   # EAS build (projectId ainda placeholder)
└── PROJECT_MEMORY.md          # ← ESTE ARQUIVO
```

---

## 3. Decisões técnicas importantes

### 3.1 Precisão interna vs display

| Camada | Precisão |
|--------|----------|
| **Interna** | 1/64" (`UNITS_PER_INCH = 64` em `dimensional.ts`) |
| **Display (default)** | 1/16" — configurável em Settings |
| **Opções de arredondamento** | 1/2, 1/4, 1/8, 1/16, 1/32, 1/64 |

**Exemplo:** `11-15/16 ÷ 2` = `5-31/32"` (interno exato; display depende da resolução escolhida).

### 3.2 Modos de display (`DisplayMode`)

| Modo | Comportamento |
|------|---------------|
| `ft-in-frac` | Padrão: `12' 6-1/2"` |
| `ft-decimal` | Pés decimais |
| `in-frac` | **Total de polegadas** (ex: `13"`, não `1' 1"`) |
| `decimal-in` | Polegadas decimais |

### 3.3 Input de frações na calculadora principal

Fluxo manual (`a⁄c`):
1. Digite polegadas (ex: `11`)
2. `a⁄c` → numerador (ex: `15`)
3. `a⁄c` → denominador → digite `16` no teclado

Ou use botões de fração rápida: `1/8`, `1/4`, `3/8`, `1/2`, `5/8`, `3/4`, `7/8`.

**Regra crítica:** fração só é aplicada quando `fracDen > 1`. Numerador parcial com `fracDen=1` NÃO converte pés/polegadas.

### 3.4 Layout da calculadora principal (UX atual — simplificado)

**Mantido:**
- Frações rápidas (`1/8` … `7/8`)
- `a⁄c` (fração manual)
- Botão `=` full-width
- Toggle **INCH | FEET** no canto superior direito do visor (único lugar para trocar unidade)
- Teclas: AC, CE, ⌫, ÷, ×, −, +, 0–9, `.`, `=`

**Removido da tela principal:**
- Memory (MC/MR/M+/M−)
- Tape (histórico)
- Botão ±
- Teclas `′`/`″` separadas (substituídas pelo toggle INCH/FEET)
- π, x², √
- Pitch, Rise, Run, Diag, Stair (ficam em EZ Calcs)

**Regras de teclas desabilitadas (UI):**
| Modo | `.` | Frações / `a⁄c` |
|------|-----|-----------------|
| INCH | desabilitado | habilitado |
| FEET (só pés) | habilitado | desabilitado |
| FEET (após `.`) | — | habilitado |

**Notação carpinteiro em FEET:** `3` `.` `6` = `3'6"` (ponto separa pés das polegadas).

**AC vs CE:** AC limpa tudo mas **preserva** `inputUnit`. CE limpa só a entrada atual, mantém cadeia.

**Hints de input:** aparecem só no Display, não empurram o teclado.

### 3.5 Modos INCH vs FEET (entrada e operações)

| Modo | Dígitos significam | Display exemplo |
|------|-------------------|-----------------|
| INCH (default) | polegadas totais | `42"` |
| FEET | pés inteiros | `8'` |
| FEET + `.` | polegadas após o ponto | `3.6` → `3'6"` |

**Operações:**
- `+` / `−` → ambos operandos na **unidade ativa** (dimensional)
- `×` / `÷` → 1º operando dimensional, 2º **escalar** (número puro, sem `"`/`'`)

**Toggle INCH↔FEET:** preserva o valor numérico, só reformata. Exemplos:
- `72"` ↔ `6'`
- `15"` ↔ `1' 3"`
- `7"` → FEET: continua `7"` (0'7", exibido compacto) — **não** vira 7 pés
- Após toggle, `isNewEntry=true`; próximo dígito sozinho **substitui** (em FEET = pés). Para encadear, use operador primeiro (`7"` → FEET → `+` → `3'`).

**`defaultInputUnit`** em Settings (`inches` | `feet`).

### 3.6 Responsividade

Hook `useResponsive.ts` com breakpoints:
- `compact` — telas estreitas (<380w) ou baixas (<700h)
- `phone` — padrão
- `tablet` — ≥768px
- `desktop` — ≥1024px ou web ≥900px

Desktop web: app centralizado (max 480px), fundo escuro.

---

## 4. Bugs corrigidos (histórico)

### 4.1 Fração parcial virava 1 pé (CRÍTICO)
- **Sintoma:** Digitar `11`, `a⁄c`, `15` mostrava `2'2"` em vez de `11"`
- **Causa:** `fracDen=1` aplicava fração incompleta
- **Fix:** `hasCompleteFraction()` exige `fracNum > 0 && fracDen > 1`
- **Teste:** `npm run verify-input`

### 4.2 Precisão interna insuficiente
- **Sintoma:** `11-15/16 ÷ 2` = `6"` (errado)
- **Causa:** armazenamento em 1/16"
- **Fix:** motor interno em 1/64"
- **Teste:** `npm run verify-input`

### 4.3 Não calculava em cima do resultado
- **Sintoma:** Após `=`, pressionar `÷ 2` mostrava `0"/2`
- **Causa:** `pressEquals` zerava acumulador; `pressOperator` lia valor atual como 0
- **Fix:** `pressOperator` usa `lastResult` quando `isNewEntry && lastResult && !accumulator`
- **Teste:** `npm run verify-store`

### 4.4 Trocar operador zerava tudo
- **Sintoma:** `11" +` depois `-` zerava em vez de trocar para `11" -`
- **Causa:** `pressOperator` recalculava com valor 0 quando `isNewEntry`
- **Fix:** se `isNewEntry && accumulator && pendingOperator`, só troca o operador
- **Teste:** `npm run verify-store`

### 4.5 Modo Inch somava errado
- **Sintoma:** `11" + 2" = 1"` (deveria ser `13"`)
- **Causa:** `formatDimensional` em modo `in-frac` usava decomposição pés/polegadas
- **Fix:** modo `in-frac` usa total de polegadas (`floor(absUnits / UNITS_PER_INCH)`)
- **Teste:** `npm run verify-chain` + `verify-store`

### 4.6 Responsividade incompleta
- **Sintoma:** imports faltando em calculadoras EZ; TypeScript quebrado
- **Fix:** `CalcFormLayout`, imports RN, `useResponsive` em todos os componentes
- **Teste:** `npm run typecheck`

---

## 5. Scripts de verificação

```bash
npm run verify-math        # Motor dimensional (6 testes)
npm run verify-input       # Input de frações (4 testes)
npm run verify-chain       # Encadeamento e in-frac
npm run verify-store       # Fluxos Zustand (4 testes)
npm run verify-sequential  # Cadeias sequenciais (28 testes)
npm run verify-behavior    # Matriz de comportamento INCH/FEET (34 testes)
npm run verify-edge        # Edge cases sequenciais (51 testes)
npm run verify-all         # math + input + store + sequential + behavior (76 testes)
npm run typecheck
npm run build:web          # Export para Vercel
```

**Rodar antes de deploy:**
```bash
npm run verify-all && npm run typecheck
```

---

## 6. Deploy

### Web (Vercel)
```bash
npx vercel --prod
```
- Build: `npm run build:web` → pasta `dist/`
- Config: `vercel.json`

### Mobile (pendente)
- `eas.json` existe mas `projectId` é placeholder
- RevenueCat **não integrado** — assinatura é simulada em `subscription.ts`
- Product IDs definidos em `app.json` extra.subscription

---

## 7. Assinatura / monetização (estado atual)

| Feature | Status |
|---------|--------|
| Paywall UI | ✅ Pronto |
| Trial 14 dias | ✅ Simulado (AsyncStorage) |
| Subscribe $4.99/mo | ✅ Simulado |
| RevenueCat / StoreKit / Play Billing | ❌ Não integrado |
| EZ Calcs PRO (board-feet, drywall, compound-miter) | ✅ Gate no paywall |

Stores em `src/store/subscription.ts` — `hasAccess()` retorna true se subscribed OU trial ativo.

---

## 8. O que falta (roadmap)

### Fase 1 — Lançamento stores (prioridade alta)
- [ ] Criar projeto EAS (`eas init`) e substituir `REPLACE_WITH_EAS_PROJECT_ID`
- [ ] Integrar RevenueCat ou billing nativo
- [ ] Screenshots + metadata App Store / Play Store
- [ ] Testar em dispositivos físicos (iPhone SE, Android pequeno)
- [ ] Configurar produtos $4.99/mês nas stores

### Fase 2 — Features
- [ ] **Project Notes** (`projects.tsx` é placeholder) — notas, fotos, voz por projeto
- [ ] Cloud backup
- [ ] Team sharing
- [ ] Integração laser/trena Bluetooth (mencionado como futuro)

### Fase 3 — Polish
- [x] Suítes `verify-sequential`, `verify-behavior`, `verify-edge` (76+ testes de calculadora)
- [ ] Testes Jest no CI (existe `dimensional.test.ts` básico)
- [ ] Repeat last operation (pressionar `=` de novo) — **não implementado**
- [x] Trocar operador antes do 2º operando (`11+` → `-`)
- [x] Trocar operador com 2º operando digitado (`10+5` → `-` = `15-`)
- [ ] GitHub Actions CI (verify-* + typecheck)
- [ ] Push notifications para fim de trial

### Limitações / débitos conhecidos
- `15 × =` com operando vazio → `0"` (buildCurrentValue = 0)
- Repetir `=` não repete última operação
- `5.0` em FEET: valor correto (`5'0"`), visor mostra `5.` até polegada ≠ 0
- `pressSign` existe no store mas **sem botão na UI**; durante cadeia, `=` após ± no operando usa 0
- Divisões encadeadas de frações podem arredondar agressivamente (resolução display)
- `+html.tsx` força `body { overflow: hidden }` — ok para calc
- Peer dependency warning `react-native-worklets` no build Vercel (não bloqueia)

---

## 9. Preferências do usuário (Anderson)

| Preferência | Valor |
|-------------|-------|
| Arredondamento default | **1/16"** |
| Unidade default | **INCHES** (toggle no visor) |
| Label fração | Manter `a⁄c` |
| Memory / Tape | **Removidos** da tela principal |
| Comunicação | Português |
| Inspiração UX | Construction Master Pro Calc |
| Preço alvo | $4.99/mês |
| Deploy | `git push` + `vercel --prod --yes` |

---

## 10. Fluxo da calculadora (para debug)

```
Estado Zustand (calculator.ts):
├── display, subDisplay, inputHint
├── inputUnit          # 'inches' | 'feet' — toggle só no visor
├── feetInchDecimal    # true após '.' em FEET (dígitos → polegadas)
├── accumulator, pendingOperator, lastResult, isNewEntry
├── inputMode          # idle | feet | inches | frac-num | frac-den | scalar
└── currentFeet/Inches, fracNum/fracDen

getActiveValue: usa lastResult só se idle + isNewEntry + sem cadeia pendente
pressOperator: encadeia, troca op, ou inicia com getActiveValue
pressEquals: usa buildCurrentValue (não getActiveValue) — operando vazio = 0
toggleInputUnit: reformata valor, valueToEntryFields, preserva cadeia se ativa
pressClear (AC): limpa tudo, preserva inputUnit
pressClearEntry (CE): resetEntry, preserva cadeia + inputUnit
```

---

## 11. Comandos úteis

```bash
# Dev local
npm start          # Expo dev server
npm run web        # Abrir no browser

# Qualidade
npm run verify-all && npm run typecheck

# Deploy web
npm run build:web && npx vercel --prod --yes

# Git
git tag -l
git show v1.1.0-behavior-verified
```

---

## 12. Para a próxima AI

1. **Leia este arquivo primeiro.**
2. Rode `npm run verify-all` — se falhar, não deploy.
3. **Não reintroduza** memory, tape, ou ± sem pedido explícito.
4. **Não reintroduza** teclas `′`/`″` separadas — unidade é só o toggle INCH/FEET no visor.
5. **Não reintroduza** teclas de denominador laranja ou Pitch/Stair na tela principal.
7. Default de arredondamento é **16** (1/16"), não 32.
8. Modo `in-frac` mostra polegadas totais, nunca pés.
9. Em FEET, dígitos = pés; polegadas via `.` (ex: `0.3` = 0'3").
10. Usuário quer publicar nas stores — priorize EAS + billing real quando pedir "próximo passo".

---

## 13. Release `v1.1.0-behavior-verified` (2026-06-20)

- Análise completa de comportamento da calculadora (teclas, cadeias, edge cases)
- Suíte `verify-calculator-behavior.ts` (34 cenários INCH/FEET)
- `verify-edge` corrigido (reset de unidade entre seções) — 51 testes
- `verify-all` = 76 testes passando
- Documentado: toggle `7"`→FEET, AC/CE, frações, limitações de `=` repetido

---

*Atualizado em 2026-06-20 — calculadora simplificada + comportamento verificado.*