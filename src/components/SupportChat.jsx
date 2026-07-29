import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { ShieldMark } from './BrandLogo';

const SUGGESTIONS = [
  'How do I check SEO testing?',
  'How do I add a website?',
  'How do alerts work?',
  'How do I enable dark mode?',
];

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm WebGuard Support — online 24/7. Ask about website monitoring, SEO testing, scans, alerts, reports, or your account.",
};

const POS_KEY = 'webguard_support_pos';
const HIDE_KEY = 'webguard_support_hidden';
const EDGE_PAD = 16;
const DEFAULT_INSET = 24;
const DRAG_THRESHOLD = 6;
const SNAP_MS = 200;
const LONG_PRESS_MS = 550;

function defaultPos(btnW = 80, btnH = 80) {
  if (typeof window === 'undefined') return { x: DEFAULT_INSET, y: DEFAULT_INSET };
  return {
    x: Math.max(EDGE_PAD, window.innerWidth - btnW - DEFAULT_INSET),
    y: Math.max(EDGE_PAD, window.innerHeight - btnH - DEFAULT_INSET),
  };
}

function clampPos(x, y, btnW, btnH) {
  const maxX = Math.max(EDGE_PAD, window.innerWidth - btnW - EDGE_PAD);
  const maxY = Math.max(EDGE_PAD, window.innerHeight - btnH - EDGE_PAD);
  return {
    x: Math.min(maxX, Math.max(EDGE_PAD, x)),
    y: Math.min(maxY, Math.max(EDGE_PAD, y)),
  };
}

function snapToEdge(x, y, btnW, btnH) {
  const mid = window.innerWidth / 2;
  const centerX = x + btnW / 2;
  const snappedX =
    centerX < mid ? EDGE_PAD : Math.max(EDGE_PAD, window.innerWidth - btnW - EDGE_PAD);
  return clampPos(snappedX, y, btnW, btnH);
}

function loadPos(btnW, btnH) {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return defaultPos(btnW, btnH);
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x !== 'number' || typeof parsed?.y !== 'number') {
      return defaultPos(btnW, btnH);
    }
    return clampPos(parsed.x, parsed.y, btnW, btnH);
  } catch {
    return defaultPos(btnW, btnH);
  }
}

function savePos(pos) {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(pos));
  } catch {
    // ignore quota / private mode
  }
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([WELCOME]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(HIDE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [pos, setPos] = useState(() => defaultPos());
  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const [menu, setMenu] = useState(null); // { x, y } viewport coords
  const [fabReady, setFabReady] = useState(false);
  const [unread, setUnread] = useState(true); // welcome / suggestion nudge

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const btnRef = useRef(null);
  const posRef = useRef(pos);
  const openRef = useRef(open);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    pointerId: null,
  });
  const longPressRef = useRef(null);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    openRef.current = open;
    if (open) setUnread(false);
  }, [open]);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setFabReady(true);
      return undefined;
    }
    const t = window.setTimeout(() => setFabReady(true), 850);
    return () => window.clearTimeout(t);
  }, []);

  // Measure button and restore saved position once mounted
  useEffect(() => {
    const el = btnRef.current;
    const w = el?.offsetWidth || 80;
    const h = el?.offsetHeight || 80;
    const next = loadPos(w, h);
    setPos(next);
    posRef.current = next;
  }, []);

  // Keep on-screen when viewport resizes
  useEffect(() => {
    const onResize = () => {
      const el = btnRef.current;
      const w = el?.offsetWidth || 80;
      const h = el?.offsetHeight || 80;
      setPos((p) => {
        const next = clampPos(p.x, p.y, w, h);
        savePos(next);
        return next;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, messages, sending]);

  useEffect(() => {
    if (!menu) return undefined;
    const close = () => setMenu(null);
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const getBtnSize = () => {
    const el = btnRef.current;
    return { w: el?.offsetWidth || 80, h: el?.offsetHeight || 80 };
  };

  const resetPosition = useCallback(() => {
    const { w, h } = getBtnSize();
    const next = defaultPos(w, h);
    setSnapping(true);
    posRef.current = next;
    setPos(next);
    savePos(next);
    setTimeout(() => setSnapping(false), SNAP_MS);
    setMenu(null);
  }, []);

  const hideForSession = () => {
    try {
      sessionStorage.setItem(HIDE_KEY, '1');
    } catch {
      // ignore
    }
    setHidden(true);
    setOpen(false);
    setMenu(null);
  };

  const openFeedback = () => {
    setMenu(null);
    setOpen(true);
    setInput('Feedback: ');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setError('');
    setInput('');
    const nextHistory = [...messages, { role: 'user', content: message }];
    setMessages(nextHistory);
    setSending(true);

    try {
      const data = await api('/api/support/chat', {
        method: 'POST',
        body: {
          message,
          history: nextHistory.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (!openRef.current) setUnread(true);
    } catch (err) {
      setError(err.message || 'Could not reach support. Try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm having trouble reaching the support service right now. Please check that the API is running and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const openContextMenu = (clientX, clientY) => {
    const mw = 200;
    const mh = 140;
    setMenu({
      x: Math.min(clientX, window.innerWidth - mw - 8),
      y: Math.min(clientY, window.innerHeight - mh - 8),
    });
  };

  const onPointerDown = (e) => {
    if (e.button === 2) return; // context menu handled separately
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    setMenu(null);
    const d = dragRef.current;
    d.active = true;
    d.moved = false;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.originX = posRef.current.x;
    d.originY = posRef.current.y;
    d.pointerId = e.pointerId;
    e.currentTarget.setPointerCapture?.(e.pointerId);

    clearLongPress();
    if (e.pointerType === 'touch') {
      longPressRef.current = setTimeout(() => {
        if (!dragRef.current.moved) {
          dragRef.current.active = false;
          setDragging(false);
          openContextMenu(e.clientX, e.clientY);
        }
      }, LONG_PRESS_MS);
    }
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      clearLongPress();
      setOpen(false);
    }

    const { w, h } = getBtnSize();
    setSnapping(false);
    const next = clampPos(d.originX + dx, d.originY + dy, w, h);
    posRef.current = next;
    setPos(next);
  };

  const finishDrag = (e) => {
    const d = dragRef.current;
    if (!d.active || (e && d.pointerId !== e.pointerId)) return;

    clearLongPress();
    d.active = false;
    const wasDrag = d.moved;
    setDragging(false);

    if (wasDrag) {
      const { w, h } = getBtnSize();
      const snapped = snapToEdge(posRef.current.x, posRef.current.y, w, h);
      setSnapping(true);
      posRef.current = snapped;
      setPos(snapped);
      savePos(snapped);
      setTimeout(() => setSnapping(false), SNAP_MS);
    } else {
      setOpen((v) => !v);
    }
  };

  const onPointerUp = (e) => finishDrag(e);
  const onPointerCancel = () => {
    clearLongPress();
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    if (d.moved) {
      const { w, h } = getBtnSize();
      const snapped = snapToEdge(posRef.current.x, posRef.current.y, w, h);
      setSnapping(true);
      posRef.current = snapped;
      setPos(snapped);
      savePos(snapped);
      setTimeout(() => setSnapping(false), SNAP_MS);
    }
  };

  const onContextMenu = (e) => {
    e.preventDefault();
    clearLongPress();
    dragRef.current.active = false;
    setDragging(false);
    openContextMenu(e.clientX, e.clientY);
  };

  const onDoubleClick = (e) => {
    e.preventDefault();
    resetPosition();
  };

  // Chat panel placement: prefer above button; flip below if not enough space
  const { w: btnW, h: btnH } = getBtnSize();
  const panelW = Math.min(typeof window !== 'undefined' ? window.innerWidth - 32 : 380, 380);
  const panelH = Math.min(typeof window !== 'undefined' ? window.innerHeight * 0.7 : 520, 520);
  const spaceAbove = pos.y - EDGE_PAD;
  const openAbove = spaceAbove >= Math.min(panelH, 280);
  const panelLeft = Math.min(
    Math.max(EDGE_PAD, pos.x + btnW - panelW),
    typeof window !== 'undefined' ? window.innerWidth - panelW - EDGE_PAD : pos.x
  );
  const panelTop = openAbove
    ? Math.max(EDGE_PAD, pos.y - 12 - panelH)
    : pos.y + btnH + 12;

  if (hidden) return null;

  return (
    <>
      {open && (
        <div
          className="fixed z-[9999] flex w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
          style={{ left: panelLeft, top: panelTop }}
          role="dialog"
          aria-label="WebGuard AI Support"
        >
          <header className="flex items-center gap-3 border-b border-border bg-brand px-4 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
              <ShieldMark size={28} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">WebGuard Support</p>
              <p className="text-[11px] text-white/85 flex items-center gap-1.5">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300">
                  <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-60" />
                </span>
                AI assistant · Online 24/7
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-white/90 hover:bg-white/15"
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-canvas">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand text-white rounded-br-md'
                      : 'bg-surface border border-border text-ink rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 text-sm text-muted">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-surface px-3 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={sending}
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-ink hover:border-brand/40 hover:text-brand disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="px-3 py-1 text-xs text-down bg-down-soft border-t border-border">{error}</p>
          )}

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-border bg-surface p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask WebGuard Support…"
              disabled={sending}
              className="flex-1 rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm outline-none focus:border-brand disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        ref={btnRef}
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        className={[
          'support-fab fixed z-[9999] touch-none select-none rounded-full p-0',
          fabReady ? 'support-fab--ready' : 'support-fab--enter',
          dragging ? 'support-fab--dragging' : 'support-fab--idle',
          snapping ? 'support-fab--snapping' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          left: pos.x,
          top: pos.y,
          cursor: dragging ? 'grabbing' : 'pointer',
        }}
        aria-expanded={open}
        aria-label={open ? 'Close support chat' : 'Open AI support chat'}
      >
        <span className="support-fab__float">
          <span className="support-fab__press">
            {open ? (
              <span className="grid h-20 w-20 place-items-center text-2xl font-semibold text-brand">
                ✕
              </span>
            ) : (
              <img
                src="/ai-support-icon.png?v=3"
                alt=""
                draggable={false}
                className="support-fab__icon h-20 w-20 rounded-full object-contain p-1 pointer-events-none"
              />
            )}
          </span>
        </span>
        {unread && !open ? (
          <span className="support-fab__badge" aria-hidden="true" />
        ) : null}
      </button>

      {menu && (
        <div
          className="fixed z-[10000] min-w-[180px] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl"
          style={{ left: menu.x, top: menu.y }}
          role="menu"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3.5 py-2 text-left text-sm text-ink hover:bg-canvas"
            onClick={resetPosition}
          >
            Reset Position
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3.5 py-2 text-left text-sm text-ink hover:bg-canvas"
            onClick={hideForSession}
          >
            Hide for this session
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3.5 py-2 text-left text-sm text-ink hover:bg-canvas"
            onClick={openFeedback}
          >
            Feedback
          </button>
        </div>
      )}
    </>
  );
}
