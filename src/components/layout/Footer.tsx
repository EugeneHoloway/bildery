'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { X, ArrowUp, UserRound, Paperclip, Angry, Frown, Meh, Smile, Laugh } from 'lucide-react'
import pkg from '../../../package.json'
const version = pkg.version

const navItems = [
  { label: 'Bildery', href: '/' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Docs', href: '/docs' },
  { label: 'Sandbox', href: '/sandbox' },
  { label: 'About', href: '/about' },
]

type MessageType =
  | { kind: 'user'; id: number; text: string }
  | { kind: 'system'; id: number; text: string }
  | { kind: 'typing'; id: number }
  | { kind: 'agent'; id: number; text: string }

const RATING_OPTIONS = [
  { score: 1, Icon: Angry,  label: 'Terrible' },
  { score: 2, Icon: Frown,  label: 'Bad'      },
  { score: 3, Icon: Meh,    label: 'Okay'     },
  { score: 4, Icon: Smile,  label: 'Good'     },
  { score: 5, Icon: Laugh,  label: 'Great'    },
]

type CsatState = 'hidden' | 'rating' | 'comment' | 'done'

let msgCounter = 0
const nextId = () => ++msgCounter

export function Footer() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<MessageType[]>([])
  const [replied, setReplied] = useState(false)
  const [userMsgCount, setUserMsgCount] = useState(0)
  const [csatState, setCsatState] = useState<CsatState>('hidden')
  const [csatRating, setCsatRating] = useState<number | null>(null)
  const [csatComment, setCsatComment] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, csatState])

  function send() {
    const text = value.trim()
    if (!text) return

    const count = userMsgCount + 1
    setUserMsgCount(count)
    setMessages(prev => [...prev, { kind: 'user', id: nextId(), text }])
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    textareaRef.current?.focus()

    if (!replied) {
      setReplied(true)
      setTimeout(() => {
        setMessages(prev => [...prev, { kind: 'system', id: nextId(), text: 'Please hold on, an agent will be with you shortly.' }])
      }, 1200)

      setTimeout(() => {
        setMessages(prev => [...prev, { kind: 'system', id: nextId(), text: 'Assigned to David' }])
      }, 2800)

      setTimeout(() => {
        setMessages(prev => [...prev, { kind: 'typing', id: nextId() }])
      }, 4200)

      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.kind !== 'typing'),
          { kind: 'agent', id: nextId(), text: 'Hello! My name is David. How can I help you?' },
        ])
      }, 6500)
    } else if (count === 2) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            kind: 'system',
            id: nextId(),
            text: 'This conversation is part of a demo environment and does not represent a live support session.',
          },
        ])
        setCsatState('rating')
      }, 800)
    }
  }

  function selectRating(score: number) {
    setCsatRating(score)
    if (score >= 4) {
      setCsatState('done')
    } else {
      setCsatState('comment')
    }
  }

  function submitComment() {
    setCsatState('done')
  }

  function handleClose() {
    setOpen(false)
    setValue('')
    setMessages([])
    setReplied(false)
    setUserMsgCount(0)
    setCsatState('hidden')
    setCsatRating(null)
    setCsatComment('')
    setExpanded(false)
  }

  return (
    <>
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-8 tablet:flex-row tablet:items-center tablet:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setOpen(true)}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Support
            </button>
          </nav>
          <p className="text-sm text-muted-foreground">
            2026. All rights reserved. v{version}
          </p>
        </div>
      </footer>

      {open && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 transition-all duration-300 ease-out ${expanded ? 'max-w-lg' : 'max-w-sm'}`}>
          <div className="rounded-2xl border border-border bg-background shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
              <span className="text-sm font-medium text-foreground">Ask Support</span>
              <button onClick={handleClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="px-4 pb-2 flex flex-col gap-3 max-h-64 overflow-y-auto">
                {messages.map(msg => {
                  if (msg.kind === 'user') return (
                    <div key={msg.id} className="flex items-end justify-end gap-2">
                      <div className="bg-brand text-white text-sm rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">{msg.text}</div>
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <UserRound className="size-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  )
                  if (msg.kind === 'system') return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full text-center">{msg.text}</span>
                    </div>
                  )
                  if (msg.kind === 'typing') return (
                    <div key={msg.id} className="flex items-end gap-2">
                      <div className="size-6 rounded-full bg-brand flex items-center justify-center shrink-0 text-white text-xs font-medium">D</div>
                      <div className="bg-muted text-sm rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )
                  if (msg.kind === 'agent') return (
                    <div key={msg.id} className="flex items-end gap-2">
                      <div className="size-6 rounded-full bg-brand flex items-center justify-center shrink-0 text-white text-xs font-medium">D</div>
                      <div className="bg-muted text-sm rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">{msg.text}</div>
                    </div>
                  )
                  return null
                })}

                {/* CSAT widget */}
                {csatState === 'rating' && (
                  <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-3">
                    <p className="text-xs font-medium text-foreground text-center">How would you rate your experience?</p>
                    <div className="flex justify-between">
                      {RATING_OPTIONS.map(({ score, Icon, label }) => (
                        <button
                          key={score}
                          onClick={() => selectRating(score)}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <Icon className="size-7 text-muted-foreground group-hover:text-brand transition-colors" />
                          <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {csatState === 'comment' && (
                  <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {RATING_OPTIONS.find(r => r.score === csatRating) && (() => {
                        const { Icon } = RATING_OPTIONS.find(r => r.score === csatRating)!
                        return <Icon className="size-5 text-muted-foreground shrink-0" />
                      })()}
                      <p className="text-xs font-medium text-foreground">We're sorry to hear that. What could we do better?</p>
                    </div>
                    <textarea
                      rows={2}
                      value={csatComment}
                      onChange={e => setCsatComment(e.target.value)}
                      placeholder="Tell us what went wrong..."
                      className="w-full resize-none bg-muted rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button
                      onClick={submitComment}
                      disabled={!csatComment.trim()}
                      className="self-end text-xs font-medium text-brand hover:underline disabled:opacity-40 transition-opacity"
                    >
                      Submit feedback
                    </button>
                  </div>
                )}

                {csatState === 'done' && (
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-center gap-2">
                    {RATING_OPTIONS.find(r => r.score === csatRating) && (() => {
                      const { Icon } = RATING_OPTIONS.find(r => r.score === csatRating)!
                      return <Icon className="size-4 text-muted-foreground shrink-0" />
                    })()}
                    <p className="text-xs text-muted-foreground">Thank you for your feedback!</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            {csatState === 'hidden' && (
              <div className="flex items-end gap-1 px-4 pb-3">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={value}
                  onChange={e => {
                    setValue(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                  onFocus={() => setExpanded(true)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="How can we help you?"
                  className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed max-h-40 overflow-y-auto"
                />
                <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <Paperclip className="size-4" />
                </button>
                <button
                  onClick={send}
                  disabled={!value.trim()}
                  className="size-7 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
