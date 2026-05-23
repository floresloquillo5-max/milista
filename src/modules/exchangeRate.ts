import { AppState } from '../state';
import { loadSavedRate, saveRate } from '../utils/storage';
import { formatNumber } from '../utils/format';

export function fetchRate(): void {
  const display = document.getElementById('rateDisplay');
  const lastUpdate = document.getElementById('lastUpdate');

  if (display) display.classList.add('skeleton');

  const updateDisplay = (rate: number, source: string) => {
    if (display) {
      display.classList.remove('skeleton');
      display.classList.remove('rate-offline');
      display.classList.add('rate-online');
      display.textContent = `Bs. ${formatNumber(rate)} ${source}`;
    }
    if (lastUpdate) lastUpdate.textContent = `Actualizado: ${new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`;
    AppState.state.settings.dollarRate = rate;
    saveRate(rate);
  };

  const apis = [
    { url: 'https://pydolarve.org/api/v1/dollar?page=bcv', parser: (d: Record<string, unknown>) => { const m = d?.monitors as Record<string, { price: number }> | undefined; return m?.bcv?.price || 0; } },
    { url: 'https://ve.dolarapi.com/v1/dolares/oficial', parser: (d: { promedio?: number; promedio_real?: number }) => d.promedio || d.promedio_real || 0 },
    { url: 'https://pydolarvenezuela-api.vercel.app/v1/dollar/bcv', parser: (d: { data?: { rate?: number } }) => d?.data?.rate || 0 },
  ];

  let apiIndex = 0;

  const tryNextApi = () => {
    if (apiIndex >= apis.length) {
      loadSavedRate();
      return;
    }

    const api = apis[apiIndex];
    apiIndex++;

    fetch(api.url)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (res.headers.get('X-Offline') === 'true') throw new Error('offline');
        return res.json();
      })
      .then(data => {
        const rate = api.parser(data as never);
        if (rate > 0) {
          updateDisplay(rate, '(BCV)');
        } else {
          throw new Error('Tasa inválida');
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.message === 'offline') {
          loadSavedRate();
          return;
        }
        setTimeout(tryNextApi, 500);
      });
  };

  tryNextApi();
}
