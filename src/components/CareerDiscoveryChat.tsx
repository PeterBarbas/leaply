'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

type Msg = { from: 'bot' | 'you'; text: string };
type QA = { q: string; a: string };
type CurrentQ =
  | { text: string; ui: 'mcq'; options: string[] }
  | { text: string; ui: 'text'; placeholder?: string }
  | null;

type Pref = 'student' | 'midcareer' | 'other' | null;

const FIRST_Q = 'Which best describes you right now?';
const FIRST_OPTIONS = [
  'I’m in secondary school deciding what to study',
  'I’m mid-career and exploring a change',
  'Other',
];

function Avatar({ kind }: { kind: 'bot' | 'you' }) {
  const isBot = kind === 'bot';
  return (
    <div
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border shadow-sm ${
        isBot ? 'bg-zinc-100 text-zinc-700' : 'bg-primary text-primary-foreground'
      }`}
      aria-hidden
    >
      {isBot ? '🤖' : '🤔'}
    </div>
  );
}

export default function CareerDiscoveryChat({
  hideSkip = false,
  fixedHeight = false,
  embed = false,
  initialPref = null,
}: {
  hideSkip?: boolean;
  fixedHeight?: boolean;
  embed?: boolean;
  initialPref?: Pref;
}) {
  const [qas, setQas] = useState<QA[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentQ, setCurrentQ] = useState<CurrentQ>(null);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [bootTyping, setBootTyping] = useState(true);
  const [result, setResult] = useState<
    | null
    | {
        status: 'supported' | 'unsupported';
        role?: string;
        slug?: string;
        message: string;
        created?: boolean;
      }
  >(null);

  // Now the SCROLL is only on the messages area (not around the composer)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, pending, bootTyping, currentQ]);

  useEffect(() => {
    setMessages([
      {
        from: 'bot',
        text:
          'Hey! 👋 I’ll help you find a career simulation that fits you best. I’ll ask a few short questions — let’s begin!',
      },
    ]);
    setBootTyping(true);
    const t = setTimeout(() => {
      setCurrentQ({ text: FIRST_Q, ui: 'mcq', options: FIRST_OPTIONS });
      setMessages((m) => [...m, { from: 'bot', text: FIRST_Q }]);
      setBootTyping(false);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // ✅ Use the server-provided pref instead of useSearchParams
  const prefLabel = useMemo(() => {
    if (initialPref === 'student') return 'I’m in secondary school deciding what to study';
    if (initialPref === 'midcareer') return 'I’m mid-career and exploring a change';
    if (initialPref === 'other') return 'Other';
    return null;
  }, [initialPref]);

  useEffect(() => {
    if (!prefLabel || qas.length > 0) return;
    const t = setTimeout(async () => {
      setMessages((m) => [...m, { from: 'you', text: prefLabel }]);
      const firstQas = [{ q: FIRST_Q, a: prefLabel }];
      setQas(firstQas);
      setCurrentQ(null);
      await requestNext(firstQas);
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefLabel, qas.length]);

  function addBot(text: string) {
    setMessages((m) => [...m, { from: 'bot', text }]);
  }
  function addYou(text: string) {
    setMessages((m) => [...m, { from: 'you', text }]);
  }

  async function requestNext(qasArg: QA[]) {
    setPending(true);
    try {
      const res = await fetch('/api/discover/next', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ qas: qasArg, allowCreate: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || 'Service is busy. Please try again.';
        setCurrentQ(null);
        addBot(`Heads up: ${msg} You can also tap “Skip and view all roles.”`);
        return;
      }
      if (data?.type === 'question' && data.question) {
        if (data.ui === 'mcq' && Array.isArray(data.options)) {
          setCurrentQ({ text: data.question, ui: 'mcq', options: data.options });
        } else {
          setCurrentQ({ text: data.question, ui: 'text', placeholder: data.placeholder });
        }
        addBot(data.question);
      } else if (data?.type === 'result') {
        setResult({
          status: data.status,
          role: data.role,
          slug: data.slug,
          message: data.message,
          created: data.created,
        });
        setCurrentQ(null);
        addBot(data.message);
      } else {
        setCurrentQ(null);
        addBot('I’m not sure—try rephrasing, or view all roles.');
      }
    } catch {
      setCurrentQ(null);
      addBot('I didn’t understand that. Please try one more time or tap “Skip and view all roles.”');
    } finally {
      setPending(false);
    }
  }

  async function submit() {
    if (!currentQ || currentQ.ui !== 'text') return;
    const a = input.trim();
    if (!a) return;
    addYou(a);
    const qasNext = [...qas, { q: currentQ.text, a }];
    setQas(qasNext);
    setInput('');
    setCurrentQ(null);
    await requestNext(qasNext);
    setTimeout(() => inputRef.current?.focus(), 50);

  }

  async function choose(option: string) {
    if (!currentQ || currentQ.ui !== 'mcq') return;
    addYou(option);
    if (qas.length === 0 && currentQ.text === FIRST_Q) {
      const firstQas = [{ q: FIRST_Q, a: option }];
      setQas(firstQas);
      setCurrentQ(null);
      await requestNext(firstQas);
      return;
    }
    const qasNext = [...qas, { q: currentQ.text, a: option }];
    setQas(qasNext);
    setCurrentQ(null);
    await requestNext(qasNext);
  }

  function showAvatarFor(index: number): { bot: boolean; you: boolean } {
    const msg = messages[index];
    const next = messages[index + 1];
    const isTail = !next || next.from !== msg.from;
    return { bot: msg.from === 'bot' && isTail, you: msg.from === 'you' && isTail };
  }

  // WRAPPER: full-height column so the composer is *always* at the bottom
  const wrapperClass = [
    'mx-auto w-full max-w-2xl',
    'h-full',
    'flex flex-col',
    embed ? 'min-h-0' : '',
  ].join(' ');

  // CARD / FRAME
  const frameClass = [
    'flex-1 min-h-0',
    'rounded-2xl border bg-card/70 backdrop-blur-sm',
    'flex flex-col', // column: messages (scroll) + composer (bottom)
  ].join(' ');

  // MESSAGES SCROLL AREA
  const messagesClass = [
    'flex-1 min-h-0',
    'overflow-y-auto',
    'px-3 sm:px-3',
    embed ? 'py-2' : 'py-3',
    'space-y-3',
  ].join(' ');

  // For dedicated page with fixed height, clamp the frame
  const frameStyle: React.CSSProperties | undefined = fixedHeight
    ? { height: 'calc(100dvh - 340px)' }
    : undefined;

  return (
    <div className={wrapperClass}>
      {/* hide the top utility link in embed/panel */}
      {!embed && (
        <div className="mb-1 mr-2">
          <div className="flex items-end justify-end text-xs text-muted-foreground">
            {!hideSkip && (
              <a href="/simulate" className="hover:text-foreground">
                Skip and view all roles
              </a>
            )}
          </div>
        </div>
      )}

      {/* Frame holds: messages (scroll) + composer (fixed at bottom) */}
      <div className={frameClass} style={frameStyle}>
        {/* Messages */}
        <div ref={scrollRef} className={messagesClass}>
          {messages.map((m, i) => {
            const tail = showAvatarFor(i);
            return (
              <div
                key={i}
                className={`flex items-end gap-2 ${
                  m.from === 'you' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.from === 'bot' && tail.bot ? <Avatar kind="bot" /> : <div className="w-7" />}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm break-words ${
                    m.from === 'you'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
                {m.from === 'you' && tail.you ? <Avatar kind="you" /> : <div className="w-7" />}
              </div>
            );
          })}

          {/* Initial typing dots */}
          {bootTyping && (
            <div className="flex items-start gap-2 justify-start">
              <div className="w-7" />
              <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground">
                <span className="inline-flex gap-1">
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.2s]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.2s]" />
                </span>
              </div>
            </div>
          )}

          {/* MCQ options */}
{/* MCQ options */}
{currentQ && currentQ.ui === 'mcq' && (
  <div className="flex items-start gap-2 justify-start">
    <div className="w-7" />
    <div className="max-w-[80%] min-w-0">
      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap gap-2">
        {currentQ.options.map((opt) => {
          const isFirst = currentQ.text.trim() === FIRST_Q
          return (
            <Button
              key={opt}
              // remove size="sm" to avoid enforced h-9 OR override it (see classes)
              onClick={() => choose(opt)}
              disabled={pending}
              className={[
                // responsive width
                'w-full sm:w-auto min-w-0 max-w-full',
                // allow multi-line labels
                '!h-auto py-2.5 px-4 whitespace-normal break-words text-left leading-[1.35] !items-start',
                // shape + colors
                'rounded-md font-medium shadow-sm',
                isFirst
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 text-center'
                  : 'bg-muted text-foreground hover:bg-muted/80',
              ].join(' ')}
            >
              {opt}
            </Button>
          )
        })}
      </div>
    </div>
  </div>
)}


          {/* API typing dots */}
          {pending && (
            <div className="flex items-start gap-2 justify-start">
              <div className="w-7" />
              <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground">
                <span className="inline-flex gap-1">
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.2s]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.2s]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Composer (always at bottom of the frame) */}
        <div className="px-2 sm:px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] rounded-b-2xl border-t border-foreground/10 bg-background/70 backdrop-blur">
          {result ? (
            <div className="flex flex-wrap items-center gap-3">
              {result.status === 'supported' && result.slug ? (
                <>
                  <Button asChild className="px-6">
                    <a href={`/s/${result.slug}`}>Try the {result.role} simulation</a>
                  </Button>
                  {!hideSkip && !embed && (
                    <a
                      className="text-sm text-muted-foreground underline underline-offset-4"
                      href="/simulate"
                    >
                      Or view all roles
                    </a>
                  )}
                </>
              ) : (
                <>
                  <Button asChild className="px-6">
                    <a href="/simulate">Explore corporate roles</a>
                  </Button>
                  <span className="text-sm text-muted-foreground">We’ll expand to more paths soon 🚀</span>
                </>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!pending && currentQ && currentQ.ui === 'text' && input.trim()) submit();
              }}
              className="relative"
            >
              <Input
                value={input}
                ref={inputRef}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentQ && currentQ.ui === 'text'
                    ? currentQ.placeholder || 'Type your answer…'
                    : 'Waiting for question…'
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!pending && currentQ && currentQ.ui === 'text' && input.trim()) submit();
                  }
                }}
                disabled={!currentQ || currentQ.ui !== 'text' || pending}
                className={[
                  'h-12 w-full rounded-full pr-12 pl-4',
                  'bg-muted/60 border border-foreground/10',
                  'focus-visible:ring-0 focus-visible:ring-primary focus-visible:border-foreground/10',
                  'placeholder:text-muted-foreground/60',
                ].join(' ')}
              />

              <button
                type="submit"
                disabled={!currentQ || currentQ.ui !== 'text' || !input.trim() || pending}
                className={[
                  'absolute right-1.5 top-1/2 -translate-y-1/2',
                  'inline-flex h-9 w-9 items-center justify-center rounded-full',
                  (!currentQ || currentQ.ui !== 'text' || !input.trim() || pending)
                    ? 'bg-foreground/10 text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
                  'transition-colors',
                ].join(' ')}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
