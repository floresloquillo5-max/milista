/**
 * @jest-environment jsdom
 */

import { AppState } from '../state';
import { calculateConversion, swapConversion, calculateCoverage, calculateByWeight } from '../modules/calculator';
import { CASHEA_LEVELS } from '../config/constants';

beforeEach(() => {
  document.body.innerHTML = '';
  AppState.state.settings.dollarRate = 40;
});

function setupConversionDOM(): void {
  document.body.innerHTML = `
    <input id="convAmount" value="100">
    <select id="convFrom"><option value="USD">USD</option><option value="BS">BS</option></select>
    <div id="convResultValue"></div>
    <div id="convRateUsed"></div>
    <div id="convResult"></div>
  `;
}

function setupCoverageDOM(): void {
  document.body.innerHTML = `
    <input id="manualToggle" type="checkbox" checked>
    <input id="manualAmount" value="200">
    <select id="calcCasheaLevel"><option value="1">40%</option></select>
    <div id="covTotalUsd"></div>
    <div id="covTotalBs"></div>
    <div id="covCasheaUsd"></div>
    <div id="covCasheaBs"></div>
    <div id="covUserUsd"></div>
    <div id="covUserBs"></div>
    <div id="coverageResult"></div>
  `;
}

function setupToast(): void {
  const t = document.createElement('div');
  t.id = 'toast';
  t.className = 'toast';
  document.body.appendChild(t);
}

function setupWeightDOM(): void {
  document.body.innerHTML = `
    <input id="weightProdName" value="Carne">
    <input id="weightPricePerKg" value="10">
    <input id="weightKg" value="2.5">
    <div id="weightTotalUsd"></div>
    <div id="weightTotalBs"></div>
    <div id="weightUnitPrice"></div>
    <div id="weightUnitPriceBs"></div>
    <div id="weightProdDisplay"></div>
    <div id="weightWeightDisplay"></div>
    <div id="weightResult"></div>
  `;
}

describe('calculateConversion', () => {
  it('converts USD to BS correctly', () => {
    setupConversionDOM();
    const sel = document.getElementById('convFrom') as HTMLSelectElement;
    sel.value = 'USD';
    calculateConversion();
    expect(document.getElementById('convResultValue')!.textContent).toBe('Bs. 4.000,00');
    expect(document.getElementById('convRateUsed')!.textContent).toContain('40');
  });

  it('converts BS to USD correctly', () => {
    setupConversionDOM();
    const sel = document.getElementById('convFrom') as HTMLSelectElement;
    sel.value = 'BS';
    (document.getElementById('convAmount') as HTMLInputElement).value = '200';
    calculateConversion();
    expect(document.getElementById('convResultValue')!.textContent).toBe('$5.00');
  });

  it('shows empty state when amount is zero', () => {
    setupConversionDOM();
    setupToast();
    (document.getElementById('convAmount') as HTMLInputElement).value = '0';
    calculateConversion();
    expect(document.getElementById('convResultValue')!.textContent).toBe('Ingresa un monto válido');
  });
});

describe('swapConversion', () => {
  it('toggles from USD to BS', () => {
    setupConversionDOM();
    const sel = document.getElementById('convFrom') as HTMLSelectElement;
    sel.value = 'USD';
    swapConversion();
    expect(sel.value).toBe('BS');
  });

  it('toggles from BS to USD', () => {
    setupConversionDOM();
    const sel = document.getElementById('convFrom') as HTMLSelectElement;
    sel.value = 'BS';
    swapConversion();
    expect(sel.value).toBe('USD');
  });
});

describe('calculateCoverage', () => {
  it('calculates Cashea coverage correctly with manual amount', () => {
    setupCoverageDOM();
    setupToast();
    AppState.state.settings.dollarRate = 40;
    calculateCoverage();
    const total = 200;
    const pct = CASHEA_LEVELS[1];
    const cashea = total * pct;
    const user = total - cashea;
    expect(document.getElementById('covTotalUsd')!.textContent).toBe('$200.00');
    expect(document.getElementById('covCasheaUsd')!.textContent).toBe(`$${cashea.toFixed(2)}`);
    expect(document.getElementById('covUserUsd')!.textContent).toBe(`$${user.toFixed(2)}`);
  });
});

describe('calculateByWeight', () => {
  it('calculates price by weight correctly', () => {
    setupWeightDOM();
    setupToast();
    calculateByWeight();
    expect(document.getElementById('weightTotalUsd')!.textContent).toBe('$25.00');
    expect(document.getElementById('weightUnitPrice')!.textContent).toBe('$10.00/kg');
    expect(document.getElementById('weightWeightDisplay')!.textContent).toBe('2500 gr');
  });

  it('shows $0.00 when inputs are empty', () => {
    setupWeightDOM();
    setupToast();
    (document.getElementById('weightPricePerKg') as HTMLInputElement).value = '';
    (document.getElementById('weightKg') as HTMLInputElement).value = '';
    calculateByWeight();
    expect(document.getElementById('weightTotalUsd')!.textContent).toBe('$0.00');
  });
});
