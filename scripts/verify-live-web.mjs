/**
 * Teste E2E do app em produção via Playwright.
 * Clica nos botões visíveis do teclado e lê o display principal.
 */
import { chromium } from 'playwright';

const BASE = 'https://carpenter-master-calc.vercel.app';
const results = [];

function record(label, expected, actual, pass) {
  results.push({ label, expected, actual, pass });
  console.log(pass ? `  ✓ ${label}` : `  ✗ ${label}`);
  if (!pass) {
    console.error(`    esperado: "${expected}"`);
    console.error(`    obtido:   "${actual}"`);
  }
}

async function getDisplay(page) {
  return page.evaluate(() => {
    const all = [...document.querySelectorAll('div, span')];
    const candidates = all
      .filter((el) => {
        const t = (el.textContent || '').trim();
        if (!t || t.length > 40 || el.children.length > 3) return false;
        return /^-?[\d'"\s./-]+$/.test(t) || t === '0';
      })
      .map((el) => ({
        text: (el.textContent || '').trim(),
        top: el.getBoundingClientRect().top,
        fontSize: parseFloat(getComputedStyle(el).fontSize) || 0,
        visible: el.getBoundingClientRect().height > 0,
      }))
      .filter((c) => c.visible && c.fontSize >= 22)
      .sort((a, b) => b.fontSize - a.fontSize || a.top - b.top);
    return candidates[0]?.text ?? '';
  });
}

async function clickButton(page, label) {
  const clicked = await page.evaluate((lbl) => {
    const els = [...document.querySelectorAll('div')].filter(
      (el) => el.textContent?.trim() === lbl && el.children.length <= 1,
    );
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.height > 10 && r.width > 10 && !el.closest('[aria-hidden="true"]')) {
        el.click();
        return true;
      }
    }
    return false;
  }, label);
  if (!clicked) throw new Error(`Botão não encontrado: ${label}`);
  await page.waitForTimeout(120);
}

async function pressAC(page) {
  await clickButton(page, 'AC');
}

async function runScenario(page, name, steps, expected) {
  await pressAC(page);
  for (const step of steps) {
    await clickButton(page, step);
  }
  const actual = await getDisplay(page);
  record(name, expected, actual, actual === expected);
}

async function seedStorage(page, displayMode = 'in-frac') {
  await page.addInitScript((mode) => {
    localStorage.setItem(
      'carpenter-subscription',
      JSON.stringify({
        state: {
          isSubscribed: false,
          isTrialActive: true,
          trialStartDate: new Date().toISOString(),
          subscriptionExpiry: null,
        },
        version: 0,
      }),
    );
    localStorage.setItem(
      'carpenter-settings',
      JSON.stringify({
        state: {
          fractionResolution: 16,
          displayMode: mode,
          defaultStudSpacing: 16,
          defaultRiserHeight: { units: 768 },
          defaultTreadWidth: { units: 1152 },
          defaultHeadroom: { units: 12192 },
          defaultFloorThickness: { units: 192 },
          darkMode: true,
        },
        version: 2,
      }),
    );
  }, displayMode);
}

async function main() {
  console.log(`Teste E2E — ${BASE}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await seedStorage(page, 'in-frac');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  await runScenario(
    page,
    'Básico: 10 + 5 = 15, + 3 = 18',
    ['1', '0', '+', '5', '=', '+', '3', '='],
    '18"',
  );

  await runScenario(
    page,
    'Divisão: 24 / 2 = 12, / 3 = 4',
    ['2', '4', '÷', '2', '=', '÷', '3', '='],
    '4"',
  );

  await runScenario(
    page,
    'Após =: operador usa resultado (10+5=, ÷2)',
    ['1', '0', '+', '5', '=', '÷', '2', '='],
    '7-1/2"',
  );

  await runScenario(
    page,
    'Troca operador: 11 + → - (display mantém)',
    ['1', '1', '+', '−'],
    '11"',
  );

  await runScenario(
    page,
    'Fração rápida em cadeia: 11-7/8 / 2',
    ['1', '1', '7/8', '÷', '2', '='],
    '5-15/16"',
  );

  await runScenario(
    page,
    'Conversão: 72″ → 6′',
    ['7', '2', '′'],
    "6'",
  );

  await seedStorage(page, 'ft-in-frac');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  await runScenario(
    page,
    "Pés: 60\" + 42\" = 8'6\"",
    ['6', '0', '+', '4', '2', '='],
    "8' 6\"",
  );

  await browser.close();

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\nE2E: ${passed} passou, ${failed} falhou`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('E2E falhou:', err.message);
  process.exit(2);
});