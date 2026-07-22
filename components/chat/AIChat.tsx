'use client';

import { useEffect, useRef, useState } from 'react';
import { PlantryMascot } from '@/components/common/PlantryMascot';
import { useChatUserContext } from './useChatUserContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_QUESTIONS = [
  "What's the best protein per dollar right now?",
  'Find me a meal under $5 per serving',
  'Is there anything I should avoid with a dairy allergy?',
  'How do I build a $70 weekly basket?',
];

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accumulatedRef = useRef('');
  const userContext = useChatUserContext();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    // Placeholder assistant message we fill in as chunks arrive.
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, userContext }),
      });

      if (!res.ok || !res.body) {
        throw new Error('chat request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      accumulatedRef.current = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedRef.current += decoder.decode(value, { stream: true });
        const textSoFar = accumulatedRef.current;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: textSoFar };
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: "🌱 Sorry, I couldn't respond just now — please try again in a moment.",
        };
        return next;
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          role="dialog"
          aria-label="Plantry AI chat"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3" style={{ background: 'var(--forest)' }}>
            <div className="flex items-center gap-2">
              <span className="text-white">🌱 Plantry AI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--mint-light)' }}>
                Powered by Claude
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background px-3 py-3">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2">
                <p className="px-1 text-xs text-muted-foreground">Try asking:</p>
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm hover:border-primary/50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && <PlantryMascot className="h-6 w-6 shrink-0" />}
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === 'user' ? 'text-white' : 'border border-border bg-card'
                      }`}
                      style={m.role === 'user' ? { background: 'var(--emerald)' } : undefined}
                    >
                      {m.content || (
                        <span className="inline-flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              type="text"
              id="ai-chat-input"
              name="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Plantry AI…"
              className="min-h-[44px] flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
              style={{ background: 'var(--emerald)' }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close Plantry AI chat' : 'Open Plantry AI chat'}
        className="fixed bottom-4 right-4 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full text-2xl shadow-lg"
        style={{ background: 'var(--amber)' }}
      >
        {!open && <span className="chat-pulse-ring absolute inset-0 rounded-full" />}
        <PlantryMascot className="h-8 w-8" />
      </button>
    </>
  );
}
