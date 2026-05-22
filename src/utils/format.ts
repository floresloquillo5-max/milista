export function parseFloatFromLocalString(str: string | number): number {
  if (typeof str !== 'string') str = String(str);
  let normalized = str.trim().replace(/,/g, '.');
  const parts = normalized.split('.');
  if (parts.length > 2) {
    const integerPart = parts.slice(0, -1).join('');
    const decimalPart = parts[parts.length - 1];
    normalized = integerPart + '.' + decimalPart;
  } else if (parts.length === 2 && parts[1].length > 2) {
    normalized = parts.join('');
  }
  normalized = normalized.replace(/[^0-9.]/g, '');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

export function formatUSD(amount: number): string {
  return '$' + formatNumber(amount);
}

export function formatBS(amount: number): string {
  const formatted = formatNumber(amount, 2);
  const withDotThousands = formatted.replace(/,/g, '.');
  return 'Bs. ' + withDotThousands.replace(/\.(\d{2})$/, ',$1');
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' });
}

export function getCategoryIcon(cat: string): string {
  const icons: Record<string, string> = {
    comida: '🍔', bebida: '🥤', transporte: '🚗', deudas: '💳',
    servicios: '💡', otros: '📦', salario: '💼', freelance: '💻',
    inversion: '📈', ahorro: '🐷',
  };
  return icons[cat] || '📌';
}

export function toISOShortDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function productPlaceholderImage(): string {
  return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#1A1A2E" width="100" height="100" rx="12"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="40">📦</text><text x="50" y="75" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#888">Sin imagen</text></svg>');
}
