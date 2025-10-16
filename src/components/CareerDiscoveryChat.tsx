'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Msg = { from: 'bot' | 'you'; text: string }
type QA = { q: string; a: string }
type CurrentQ =
  | { text: string; ui: 'mcq'; options: string[] }
  | { text: string; ui: 'text'; placeholder?: string }
  | null

// Local-first intro question (always MCQ)
const FIRST_Q = 'Which best describes you right now?'
const FIRST_OPTIONS = [
  'I’m in secondary school deciding what to study',
  'I’m mid-career and exploring a change',
  'Other'
]

function Avatar({ kind }: { kind: 'bot' | 'you' }) {
  const isBot = kind === 'bot'
  return (
    <div
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border shadow-sm
        ${isBot ? 'bg-zinc-100 text-zinc-700' : 'bg-primary text-primary-foreground'}
      `}
      aria-hidden
    >
      {isBot ? '🤖' : '🤔'}
    </div>
  )
}

export default function CareerDiscoveryChat({ hideSkip = false }: { hideSkip?: boolean }) {
  const [qas, setQas] = useState<QA[]>([])
  const [messages, setMessages] = useState<Msg[]>([])
  const [currentQ, setCurrentQ] = useState<CurrentQ>(null)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)      // API typing
  const [bootTyping, setBootTyping] = useState(true) // initial typing animation
  const [result, setResult] = useState<
    | null
    | {
        status: 'supported' | 'unsupported'
        role?: string
        slug?: string
        message: string
        created?: boolean
      }
  >(null)

  const endRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending, bootTyping, currentQ])

  // Auto-start with a typing delay: intro message, then after 2s the first MCQ question
  useEffect(() => {
    setMessages([
      {
        from: 'bot',
        text:
          'Hey! 👋 I’ll help you find a career simulation that fits you best. I’ll ask a few short questions — let’s begin!'
      }
    ])
    setBootTyping(true)

    const t = setTimeout(() => {
      setCurrentQ({ text: FIRST_Q, ui: 'mcq', options: FIRST_OPTIONS })
      setMessages(m => [...m, { from: 'bot', text: FIRST_Q }])
      setBootTyping(false)
    }, 2000)

    return () => clearTimeout(t)
  }, [])

  function addBot(text: string) {
    setMessages(m => [...m, { from: 'bot', text }])
  }
  function addYou(text: string) {
    setMessages(m => [...m, { from: 'you', text }])
  }

  async function requestNext(qasArg: QA[]) {
    setPending(true)
    try {
      const res = await fetch('/api/discover/next', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ qas: qasArg, allowCreate: true })
      })
      const data = await res.json()
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          'Service is busy. Please try again.'
        setCurrentQ(null)
        addBot(`Heads up: ${msg} You can also tap “Skip and view all roles.”`)
        return
      }
      if (data?.type === 'question' && data.question) {
        if (data.ui === 'mcq' && Array.isArray(data.options)) {
          setCurrentQ({ text: data.question, ui: 'mcq', options: data.options })
        } else {
          setCurrentQ({
            text: data.question,
            ui: 'text',
            placeholder: data.placeholder
          })
        }
        addBot(data.question)
      } else if (data?.type === 'result') {
        setResult({
          status: data.status,
          role: data.role,
          slug: data.slug,
          message: data.message,
          created: data.created
        })
        setCurrentQ(null)
        addBot(data.message)
      } else {
        setCurrentQ(null)
        addBot('I’m not sure—try rephrasing, or view all roles.')
      }
    } catch {
      setCurrentQ(null)
      addBot(
        'I didn’t understand that. Please try one more time or tap “Skip and view all roles.”'
      )
    } finally {
      setPending(false)
    }
  }

  async function submit() {
    if (!currentQ || currentQ.ui !== 'text') return
    const a = input.trim()
    if (!a) return
    addYou(a)
    const qasNext = [...qas, { q: currentQ.text, a }]
    setQas(qasNext)
    setInput('')
    setCurrentQ(null)
    await requestNext(qasNext)
  }

  async function choose(option: string) {
    if (!currentQ || currentQ.ui !== 'mcq') return
    addYou(option)

    // First MCQ answer → send to server
    if (qas.length === 0 && currentQ.text === FIRST_Q) {
      const firstQas = [{ q: FIRST_Q, a: option }]
      setQas(firstQas)
      setCurrentQ(null)
      await requestNext(firstQas)
      return
    }

    // Generic MCQ flow for later questions
    const qasNext = [...qas, { q: currentQ.text, a: option }]
    setQas(qasNext)
    setCurrentQ(null)
    await requestNext(qasNext)
  }

  // --- Avatar tail logic: show avatar only on the last bubble of each speaker run
  function showAvatarFor(index: number): { bot: boolean; you: boolean } {
    const msg = messages[index]
    const next = messages[index + 1]
    const isTail = !next || next.from !== msg.from
    return {
      bot: msg.from === 'bot' && isTail,
      you: msg.from === 'you' && isTail
    }
  }

  return (
    <div className='mx-auto w-full max-w-2xl h-[70vh] flex flex-col'>
      
      {/* header */}
      <div className='mb-1 mr-2'>
        <div className='flex items-end justify-end text-xs text-muted-foreground'>
          {!hideSkip && (
            <a
              href='/simulate'
              className='hover:text-foreground'
            >
              Skip and view all roles
            </a>
          )}
        </div>
      </div>

      {/* chat scroll area */}
      <div className='flex-1 overflow-y-auto rounded-2xl border bg-card/70 backdrop-blur-sm py-4 px-1 sm:px-2 space-y-3'>
        {messages.map((m, i) => {
          const tail = showAvatarFor(i)
          return (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                m.from === 'you' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Left avatar only for tail of bot run */}
              {m.from === 'bot' && tail.bot ? <Avatar kind='bot' /> : <div className='w-7' />}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm break-words ${
                  m.from === 'you'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>

              {/* Right avatar only for tail of user run */}
              {m.from === 'you' && tail.you ? <Avatar kind='you' /> : <div className='w-7' />}
            </div>
          )
        })}

        {/* Initial typing dots (boot) — no avatar here to avoid duplicates */}
        {bootTyping && (
          <div className='flex items-start gap-2 justify-start'>
            <div className='w-7' />
            <div className='rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground'>
              <span className='inline-flex gap-1'>
                <span className='inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.2s]' />
                <span className='inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60' />
                <span className='inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.2s]' />
              </span>
            </div>
          </div>
        )}

        {/* MCQ buttons under the bot bubble — no avatar (the tail bubble has it) */}
        {currentQ && currentQ.ui === 'mcq' && (
          <div className='flex items-start gap-2 justify-start'>
            <div className='w-7' />
            <div className='max-w-[80%]'>
              <div className='mt-1 flex flex-wrap gap-2'>
                {currentQ.options.map(opt => {
                  const isFirstQuestion =
                    currentQ.text.trim() === 'Which best describes you right now?'
                  return (
                    <Button
                      key={opt}
                      size='sm'
                      className={
                        isFirstQuestion
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }
                      onClick={() => choose(opt)}
                      disabled={pending}
                    >
                      {opt}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* API typing dots — no avatar to avoid double tails */}
        {pending && (
          <div className='flex items-start gap-2 justify-start'>
            <div className='w-7' />
            <div className='rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground'>
              <span className='inline-flex gap-1'>
                <span className='inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.2s]' />
                <span className='inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60' />
                <span className='inline-block h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.2s]' />
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* bottom input area */}
      <div className='pt-3'>
        {result ? (
          <div className='flex flex-wrap items-center gap-3'>
            {result.status === 'supported' && result.slug ? (
              <>
                <Button asChild className='px-6'>
                  <a href={`/s/${result.slug}`}>Try the {result.role} simulation</a>
                </Button>
                {!hideSkip && (
                  <a
                    className='text-sm text-muted-foreground underline underline-offset-4'
                    href='/simulate'
                  >
                    Or view all roles
                  </a>
                )}
              </>
            ) : (
              <>
                <Button asChild className='px-6'>
                  <a href='/simulate'>Explore corporate roles</a>
                </Button>
                <span className='text-sm text-muted-foreground'>
                  We’ll expand to more paths soon 🚀
                </span>
              </>
            )}
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                currentQ && currentQ.ui === 'text'
                  ? currentQ.placeholder || 'Type your answer…'
                  : 'Waiting for question…'
              }
              onKeyDown={e => {
                if (e.key === 'Enter') submit()
              }}
              disabled={!currentQ || currentQ.ui !== 'text' || pending}
            />
            <Button
              onClick={submit}
              disabled={
                !currentQ || currentQ.ui !== 'text' || !input.trim() || pending
              }
            >
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
