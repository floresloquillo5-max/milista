import { AppState } from '../state';
import { loadNotificationPrefs, saveNotificationPrefs } from '../utils/storage';
import { showToast } from '../utils/dom';
import type { NotificationPrefs } from '../types';

export function setupNotifications(): void {
  const toggle = document.getElementById('notificationToggle') as HTMLInputElement | null;
  const timeInput = document.getElementById('notificationTime') as HTMLInputElement | null;
  const daySelect = document.getElementById('notificationDay') as HTMLSelectElement | null;

  if (!toggle || !timeInput || !daySelect) return;

  const prefs = loadNotificationPrefs();
  if (prefs) {
    toggle.checked = prefs.enabled;
    timeInput.value = prefs.time || '09:00';
    daySelect.value = prefs.day || 'daily';
  }

  toggle.addEventListener('change', () => {
    const prefs: NotificationPrefs = {
      enabled: toggle.checked,
      time: timeInput.value,
      day: daySelect.value,
    };
    saveNotificationPrefs(prefs);
    if (toggle.checked) {
      scheduleNotificationReminder(prefs);
      showToast('🔔 Recordatorio activado');
    } else {
      clearNotificationReminder();
      showToast('🔕 Recordatorio desactivado');
    }
  });

  timeInput.addEventListener('change', () => {
    const prefs: NotificationPrefs = {
      enabled: toggle.checked,
      time: timeInput.value,
      day: daySelect.value,
    };
    saveNotificationPrefs(prefs);
    if (toggle.checked) {
      clearNotificationReminder();
      scheduleNotificationReminder(prefs);
    }
  });

  daySelect.addEventListener('change', () => {
    const prefs: NotificationPrefs = {
      enabled: toggle.checked,
      time: timeInput.value,
      day: daySelect.value,
    };
    saveNotificationPrefs(prefs);
  });

  if (toggle.checked && prefs) {
    scheduleNotificationReminder(prefs);
  }
}

function scheduleNotificationReminder(prefs: NotificationPrefs): void {
  clearNotificationReminder();
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  const checkInterval = setInterval(() => {
    if (Notification.permission !== 'granted') return;
    if (!prefs.enabled) return;

    const now = new Date();
    const [hours, minutes] = prefs.time.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = hours * 60 + minutes;

    if (currentMinutes === targetMinutes) {
      const dayMatch = prefs.day === 'daily' ||
        (prefs.day === 'monday' && now.getDay() === 1) ||
        (prefs.day === 'tuesday' && now.getDay() === 2) ||
        (prefs.day === 'wednesday' && now.getDay() === 3) ||
        (prefs.day === 'thursday' && now.getDay() === 4) ||
        (prefs.day === 'friday' && now.getDay() === 5) ||
        (prefs.day === 'saturday' && now.getDay() === 6) ||
        (prefs.day === 'sunday' && now.getDay() === 0);

      if (dayMatch) {
        sendNotification('📝 Finova', 'No olvides registrar tus gastos del día 💰', prefs);
      }
    }
  }, 30000);

  AppState.state.notificationReminderInterval = checkInterval;
}

function clearNotificationReminder(): void {
  if (AppState.state.notificationReminderInterval) {
    clearInterval(AppState.state.notificationReminderInterval);
    AppState.state.notificationReminderInterval = null;
  }
}

function sendNotification(title: string, body: string, prefs: NotificationPrefs): void {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛒</text></svg>' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛒</text></svg>' });
      }
    });
  }
}
