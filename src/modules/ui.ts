import { AppState } from '../state';
import { loadTheme, saveTheme } from '../utils/storage';
import { showToast } from '../utils/dom';
import { renderCalendar } from './calendar';

export function loadThemeFromStorage(): void {
  const theme = loadTheme();
  applyTheme(theme);
}

function applyTheme(theme: string): void {
  document.body.classList.toggle('light-theme', theme === 'light');
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

export function toggleTheme(): void {
  const isLight = document.body.classList.contains('light-theme');
  const next = isLight ? 'dark' : 'light';
  AppState.state.settings.theme = next;
  saveTheme(next);
  applyTheme(next);
}

export function setupMenu(): void {
  const buttons = document.querySelectorAll('.menu-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = (btn as HTMLElement).dataset.view;
      if (!view) return;

      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById(view + '-view');
      if (target) target.classList.add('active');

      document.body.classList.toggle('main-view-active', view === 'main');

      window.scrollTo(0, 0);

      if (view === 'calendario') {
        renderCalendar();
      }
      if (view === 'finanzas') {
        window.dispatchEvent(new CustomEvent('finance:updated'));
      }
    });
  });
}

export function setupFaq(): void {
  const container = document.getElementById('faq-view');
  if (!container) return;
  container.addEventListener('click', (e: Event) => {
    const question = (e.target as HTMLElement).closest('.faq-question');
    if (!question) return;
    const item = question.closest('.faq-item') as HTMLElement | null;
    if (!item) return;
    const answer = item.querySelector('.faq-answer') as HTMLElement | null;
    if (!answer) return;
    item.classList.toggle('open');
  });
}

export function adjustLayoutForScreen(): void {
  const isLandscape = window.innerWidth > window.innerHeight;
  document.body.classList.toggle('landscape', isLandscape);
}

export function switchToMainView(): void {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const main = document.getElementById('main-view');
  if (main) main.classList.add('active');
  document.body.classList.add('main-view-active');
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
  const mainBtn = document.querySelector('.menu-btn[data-view="main"]');
  if (mainBtn) mainBtn.classList.add('active');
  window.scrollTo(0, 0);
}

export function toggleListManagement(): void {
  const toggle = document.getElementById('listManagementToggle');
  const section = document.getElementById('listManagementSection');
  if (!toggle || !section) return;
  toggle.classList.toggle('active');
  section.classList.toggle('visible');
  if (section.classList.contains('visible')) {
    window.dispatchEvent(new Event('listmanagement:open'));
  }
}

export function copyDonation(text: string): void {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('✅ Copiado al portapapeles'))
      .catch(() => fallbackCopyDonation(text));
  } else {
    fallbackCopyDonation(text);
  }
}

function fallbackCopyDonation(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('✅ Copiado al portapapeles');
  } catch {
    showToast('⚠️ No se pudo copiar');
  }
  document.body.removeChild(textarea);
}
