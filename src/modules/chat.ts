import * as Ably from 'ably';
import { ABLY_CONFIG } from '../config/constants';

interface ChatMessage {
  id: string;
  nickname: string;
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'chat_messages';
const NICKNAME_KEY = 'chat_nickname';
const MAX_MESSAGES = 200;

let ablyChannel: Ably.RealtimeChannel | null = null;
let currentNickname = '';

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch { /* ignore */ }
}

function loadNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_KEY) || '';
  } catch {
    return '';
  }
}

function saveNickname(name: string): void {
  try {
    localStorage.setItem(NICKNAME_KEY, name);
  } catch { /* ignore */ }
}

function renderMessages(): void {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const messages = loadMessages();
  if (messages.length === 0) {
    container.innerHTML = '<div class="chat-empty">No hay mensajes aún. ¡Sé el primero en escribir!</div>';
    return;
  }
  container.innerHTML = messages.map(m => {
    const time = new Date(m.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const isOwn = m.nickname === currentNickname;
    return `
      <div class="chat-msg ${isOwn ? 'chat-msg-own' : 'chat-msg-other'}">
        <div class="chat-msg-header">
          <span class="chat-msg-nick">${escapeHtml(m.nickname)}</span>
          <span class="chat-msg-time">${time}</span>
        </div>
        <div class="chat-msg-text">${escapeHtml(m.text)}</div>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function receiveMessage(data: unknown): void {
  const msg = data as ChatMessage;
  const messages = loadMessages();
  const exists = messages.some(m => m.id === msg.id);
  if (!exists) {
    messages.push(msg);
    if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);
    saveMessages(messages);
    renderMessages();
  }
}

function sendMessage(): void {
  const input = document.getElementById('chatInput') as HTMLInputElement | null;
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  if (!currentNickname) {
    const nickInput = document.getElementById('chatNickname') as HTMLInputElement | null;
    if (!nickInput) return;
    const nick = nickInput.value.trim();
    if (!nick) {
      (document.querySelector('.chat-nickname-input') as HTMLElement)?.classList.add('shake');
      setTimeout(() => (document.querySelector('.chat-nickname-input') as HTMLElement)?.classList.remove('shake'), 400);
      return;
    }
    setNickname(nick);
  }

  const msg: ChatMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nickname: currentNickname,
    text,
    timestamp: Date.now(),
  };

  const messages = loadMessages();
  messages.push(msg);
  if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);
  saveMessages(messages);
  renderMessages();
  input.value = '';

  if (ablyChannel) {
    ablyChannel.publish('message', msg);
  }
}

function handleNicknameKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    const input = e.target as HTMLInputElement;
    const nick = input.value.trim();
    if (!nick) return;
    setNickname(nick);
    document.getElementById('chatInput')?.focus();
  }
}

function handleInputKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') sendMessage();
}

function setNickname(nick: string): void {
  currentNickname = nick;
  saveNickname(nick);
  document.getElementById('chatNicknameSection')?.classList.add('chat-hidden');
  document.getElementById('chatMainSection')?.classList.remove('chat-hidden');
  renderMessages();
  const chatFooter = document.querySelector('.chat-footer p');
  if (chatFooter) {
    chatFooter.innerHTML = `Hablando como <strong>${escapeHtml(nick)}</strong> · <a href="#" id="chatChangeNickLink" style="color:var(--primary);text-decoration:none;">cambiar nombre</a>`;
    document.getElementById('chatChangeNickLink')?.addEventListener('click', (e: Event) => {
      e.preventDefault();
      currentNickname = '';
      saveNickname('');
      document.getElementById('chatNicknameSection')?.classList.remove('chat-hidden');
      document.getElementById('chatMainSection')?.classList.add('chat-hidden');
      const nickInput = document.getElementById('chatNickname') as HTMLInputElement | null;
      if (nickInput) { nickInput.value = ''; nickInput.focus(); }
      const cf = document.querySelector('.chat-footer p');
      if (cf) cf.textContent = 'Los mensajes se almacenan localmente en tu dispositivo y se comparten en tiempo real entre usuarios activos.';
    });
  }
}

let ablyRealtime: Ably.Realtime | null = null;
let connectTimeout: ReturnType<typeof setTimeout> | null = null;

function setConnectionStatus(ok: boolean, msg?: string): void {
  const el = document.getElementById('chatConnectionStatus');
  if (!el) return;
  if (ok) {
    el.innerHTML = '🟢 Conectado';
    el.className = 'chat-status-ok';
    if (connectTimeout) { clearTimeout(connectTimeout); connectTimeout = null; }
  } else {
    el.innerHTML = `🔴 ${msg || 'Desconectado'}`;
    el.className = 'chat-status-err';
  }
}

function connectAbly(): void {
  if (!ABLY_CONFIG.key) {
    setConnectionStatus(false, 'API key no configurada');
    return;
  }

  try {
    ablyRealtime = new Ably.Realtime({ key: ABLY_CONFIG.key });
    const conn = ablyRealtime.connection;

    conn.on('connecting', () => {
      setConnectionStatus(false, 'Conectando...');
    });

    conn.on('connected', () => {
      setConnectionStatus(true);
    });

    conn.on('failed', (err: { reason?: { message?: string } }) => {
      setConnectionStatus(false, err?.reason?.message || 'Error de conexión');
    });

    conn.on('disconnected', () => {
      setConnectionStatus(false, 'Reconectando...');
    });

    connectTimeout = setTimeout(() => {
      if (conn.state !== 'connected') {
        setConnectionStatus(false, 'Tiempo de espera agotado. ¿Firewall o bloqueo de red?');
      }
    }, 15000);

    ablyChannel = ablyRealtime.channels.get(ABLY_CONFIG.channelName);
    ablyChannel.subscribe('message', (message: Ably.InboundMessage) => {
      receiveMessage(message.data);
    });
  } catch (err) {
    setConnectionStatus(false, 'Error al iniciar Ably');
    console.error('Ably init error:', err);
  }
}

export function setupChat(): void {
  const savedNick = loadNickname();
  if (savedNick) {
    setNickname(savedNick);
  }

  renderMessages();
  connectAbly();

  document.getElementById('chatSendBtn')?.addEventListener('click', sendMessage);
  document.getElementById('chatInput')?.addEventListener('keydown', handleInputKeydown);
  document.getElementById('chatNickname')?.addEventListener('keydown', handleNicknameKeydown);

  if (document.getElementById('chatNickname') && !currentNickname) {
    (document.getElementById('chatNickname') as HTMLInputElement)?.focus();
  }

  const faqLink = document.getElementById('chatFaqLink');
  if (faqLink) {
    faqLink.addEventListener('click', (e: Event) => {
      e.preventDefault();
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('chat-view');
      if (target) target.classList.add('active');
      document.body.classList.remove('main-view-active');
      document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
      window.scrollTo(0, 0);
    });
  }
}
