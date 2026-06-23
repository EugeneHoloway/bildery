'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import {
  useSidebar,
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, MessageSquare, Globe, Facebook, Mail, Settings, Lock, Reply, ChevronLeft, Sparkles,
  TrendingUp, ShieldCheck, ShieldAlert, Clock, Flame, CreditCard, Gift,
  LogIn, Gamepad2, CircleDollarSign, CircleAlert, Timer,
  BellOff, Share2, ChevronDown, ChevronRight, Copy, Bold, Italic,
  Link2, Undo2, Redo2, List, ListOrdered, Code2, Smile, Paperclip,
  Mic, Maximize2, Twitter, Linkedin, Phone, Building2, MapPin, Languages, ArrowRight, RefreshCw,
  Pencil, PhoneCall, X, User, BadgeCheck, Crown, UserX, ShieldBan,
  Minus, Wrench, BarChart2, Tag, Plus, AlertTriangle, SlidersHorizontal,
  Bot, SendHorizonal, Rocket, Lightbulb, Database, Check,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Channel = 'website' | 'facebook' | 'whatsapp' | 'email' | 'api'
type Priority = 'urgent' | 'high' | 'normal'
type Tab = 'mine' | 'unassigned' | 'all'

interface Conversation {
  id: string
  ticketId: string
  name: string
  channel: Channel
  channelLabel: string
  preview: string
  time: string
  priority?: Priority
  tags?: string[]
  unread?: number
  isNote?: boolean
  verified?: boolean
  vip?: boolean
  assigned?: boolean
  assignee?: string
  isReply?: boolean
  unknown?: boolean
  labels?: string[]
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    ticketId: '769756',
    name: 'Klaus Crawley',
    channel: 'website',
    channelLabel: 'Chat',
    preview: '@Ben Nugent Can we use Captain here to automate these queries?',
    time: '1d · 34m',
    priority: 'normal',
    tags: ['device-setup'],
    isNote: true,
    verified: true,
    assigned: true,
    assignee: 'David Wallace',
    labels: ['login-issue'],
  },
  {
    id: '2',
    ticketId: '769757',
    name: 'Coreen Mewett',
    channel: 'facebook',
    channelLabel: 'Chat',
    preview: "I'm sorry to hear that. Please chang...",
    time: '1d · 37m',
    unread: 2,
    assigned: true,
    assignee: 'David Wallace',
  },
  {
    id: '3',
    ticketId: '769758',
    name: 'Quent Dalliston',
    channel: 'whatsapp',
    channelLabel: 'Chat',
    preview: 'Sure! Can you please provide me wi...',
    time: '1d · 37m',
    verified: true,
    vip: true,
    assigned: false,
  },
  {
    id: '4',
    ticketId: '769759',
    name: 'Nathaniel Vannuchi',
    channel: 'facebook',
    channelLabel: 'Chat',
    preview: 'Hey there, I need some help with billing...',
    time: '1d · 37m',
    priority: 'normal',
    vip: true,
    assigned: true,
    assignee: 'David Wallace',
  },
  {
    id: '11',
    ticketId: '769760',
    name: 'Unknown user',
    channel: 'website',
    channelLabel: 'Chat',
    preview: "Hi, I can't log in to my account and I lost access to my email too",
    time: '4h · 12m',
    unread: 1,
    unknown: true,
    assigned: true,
    assignee: 'David Wallace',
  },
  {
    id: '5',
    ticketId: '769761',
    name: 'Claus Jira',
    channel: 'whatsapp',
    channelLabel: 'Chat',
    preview: "I'm sorry to hear that. Can you plea...",
    time: '1d · 37m',
    assigned: false,
  },
  {
    id: '6',
    ticketId: '769762',
    name: 'Merrile Petruk',
    channel: 'email',
    channelLabel: 'Email',
    preview: "I'm sorry to hear that. Can you plea...",
    time: '1d · 37m',
    priority: 'urgent',
    assigned: true,
    assignee: 'David Wallace',
    isReply: true,
  },
  {
    id: '7',
    ticketId: '769763',
    name: 'Candice Matherson',
    channel: 'email',
    channelLabel: 'Email',
    preview: 'How may i help you ?',
    time: '1d · 37m',
    priority: 'urgent',
    tags: ['billing', 'lead'],
    unread: 10,
    assigned: true,
    assignee: 'David Wallace',
    labels: ['billing'],
  },
  {
    id: '8',
    ticketId: '769764',
    name: 'Tom Harrigan',
    channel: 'email',
    channelLabel: 'Email',
    preview: 'Can you help me set up the integration?',
    time: '2d · 12m',
    assigned: false,
  },
  {
    id: '9',
    ticketId: '769765',
    name: 'Sandra Mills',
    channel: 'email',
    channelLabel: 'Email',
    preview: 'My subscription was charged twice...',
    time: '2d · 45m',
    priority: 'high',
    tags: ['billing'],
    assigned: true,
    assignee: 'David Wallace',
    isReply: true,
    labels: ['billing', 'refund'],
  },
  {
    id: '12',
    ticketId: '769766',
    name: 'Unknown user',
    channel: 'whatsapp',
    channelLabel: 'Chat',
    preview: 'How can I recover access to my account?',
    time: '6h · 50m',
    unknown: true,
    assigned: false,
  },
  {
    id: '10',
    ticketId: '769767',
    name: 'Dmitri Volkov',
    channel: 'website',
    channelLabel: 'Chat',
    preview: 'Looking for enterprise pricing options',
    time: '3d · 2h',
    tags: ['lead'],
    verified: true,
    vip: true,
    assigned: false,
  },
]

const TAG_COLORS: Record<string, string> = {
  'device-setup': 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
  billing: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
  lead: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50',
  refund: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
  'login-issue': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
  'technical': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
  'vip': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50',
  'feature-request': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
}

const ALL_LABELS = ['billing', 'lead', 'device-setup', 'login-issue', 'refund', 'technical', 'vip', 'feature-request']

const CHANNEL_ICON_MAP: Record<Channel, React.ElementType> = {
  website: MessageSquare,
  facebook: MessageSquare,
  whatsapp: MessageSquare,
  email: Mail,
  api: Settings,
}

type Message = { from: 'user' | 'agent' | 'system'; text: string; time: string }

const CONVERSATION_MESSAGES: Record<string, Message[]> = {
  '1': [
    { from: 'user', text: "Hi, I claimed a bonus 3 days ago but it still hasn't been added to my account. Can you check what's going on?", time: 'Jan 15, 12:32 PM' },
    { from: 'agent', text: "Hi Klaus! I can look into that for you. Could you confirm which bonus you're referring to — was it the 100% deposit bonus or the free spins offer?", time: 'Jan 15, 12:33 PM' },
    { from: 'user', text: "It's the 100% deposit bonus I activated on January 12th. The funds showed up but the bonus never appeared in my balance.", time: 'Jan 15, 12:35 PM' },
    { from: 'agent', text: "Got it! I've checked your account. The bonus is actually pending — it will be credited automatically once you complete the wagering requirement. You currently have $340 out of $500 wagered.", time: 'Jan 15, 12:37 PM' },
    { from: 'user', text: "Oh I see, so I just need to wager another $160 and the bonus gets added automatically? No need to contact support again?", time: 'Jan 15, 12:40 PM' },
    { from: 'system', text: 'Assigned to support m2 by Mathew M', time: '' },
    { from: 'system', text: 'Mathew M self-assigned this conversation', time: '' },
    { from: 'system', text: 'Mathew M set the priority to high', time: '' },
    { from: 'system', text: 'Mathew M added device-setup', time: '' },
  ],
  '2': [
    { from: 'user', text: "Hi, I made a deposit 2 hours ago but it still hasn't appeared in my account.", time: 'Jan 14, 10:02 AM' },
    { from: 'agent', text: "Hi Coreen! I'm sorry to hear that. Could you please share your transaction ID or the amount you deposited?", time: 'Jan 14, 10:05 AM' },
    { from: 'user', text: 'The amount was $250 and the transaction ID is TXN-8847291.', time: 'Jan 14, 10:07 AM' },
    { from: 'agent', text: "Thank you! I've located your transaction. It looks like it's pending on the payment provider's side. This can sometimes take up to 4 hours.", time: 'Jan 14, 10:10 AM' },
    { from: 'user', text: "4 hours?! That's way too long. I wanted to use those funds right now.", time: 'Jan 14, 10:12 AM' },
    { from: 'agent', text: "I completely understand your frustration, Coreen. I've escalated this to our Payments team and they will prioritize your case.", time: 'Jan 14, 10:15 AM' },
    { from: 'system', text: 'Transferred to Payments & Withdrawals team', time: 'Jan 14, 10:16 AM' },
    { from: 'user', text: 'OK, how long will it take now?', time: 'Jan 14, 10:18 AM' },
    { from: 'agent', text: "Our payments team is reviewing it now. You should see the funds within the next 30–60 minutes. I'll send you a confirmation once it's done.", time: 'Jan 14, 10:20 AM' },
    { from: 'user', text: 'Alright, thank you. I hope this gets resolved soon.', time: 'Jan 14, 10:22 AM' },
  ],
  '12': [
    { from: 'user', text: 'Hello, I cannot access my account anymore. I forgot my password and I also lost access to the email I registered with. How can I recover it?', time: 'Today, 9:14 AM' },
    { from: 'agent', text: 'Hi! I can help you with account recovery. Could you please provide any of the following: your username, phone number linked to the account, or your last deposit amount and date?', time: 'Today, 9:17 AM' },
    { from: 'user', text: "I don't remember my username either. My phone number is +447700900142 and I think my last deposit was around £50 but I'm not sure of the exact date.", time: 'Today, 9:21 AM' },
    { from: 'agent', text: "Thank you. I was able to find a possible match based on the phone number, but I need to verify your identity before I can share any account details or grant access. Could you confirm your full name and date of birth?", time: 'Today, 9:24 AM' },
    { from: 'user', text: 'My name is James. Date of birth is March 14, 1991.', time: 'Today, 9:26 AM' },
    { from: 'system', text: 'Identity not verified — user record unlinked', time: '' },
  ],
}

const MINE_IDS = new Set(['1', '2', '4', '6', '7', '9', '11'])
const UNASSIGNED_IDS = new Set(['3', '5', '8', '10', '12'])

interface PrevConversation {
  id: string
  channel: Channel
  preview: string
  date: string
  status: 'resolved' | 'open'
}

const PREV_CONVERSATIONS: PrevConversation[] = [
  { id: 'p1', channel: 'email', preview: 'How do I reset my password?', date: '12 Jan 2026', status: 'resolved' },
  { id: 'p2', channel: 'website', preview: 'Can we get a demo of the enterprise plan?', date: '5 Jan 2026', status: 'resolved' },
  { id: 'p3', channel: 'whatsapp', preview: 'My invoice is incorrect, please check', date: '28 Dec 2025', status: 'resolved' },
  { id: 'p4', channel: 'facebook', preview: 'Still waiting on a refund from last month', date: '15 Dec 2025', status: 'open' },
]

const TABS: { key: Tab; label: string; count: number }[] = [
  { key: 'mine', label: 'Mine', count: MINE_IDS.size },
  { key: 'unassigned', label: 'Unassigned', count: UNASSIGNED_IDS.size },
  { key: 'all', label: 'All', count: CONVERSATIONS.length },
]

type CopilotMessage = { role: 'user' | 'assistant'; text: string }

const COPILOT_RESPONSES: Record<string, string> = {
  default: "Based on the conversation context, I recommend verifying the customer's account status first, then checking if the bonus conditions have been met. Let me know if you need specific wording for your reply.",
  bonus: "The 100% deposit bonus activates automatically once the player completes the required wagering. Current progress: $340/$500. No manual action needed — just inform the customer.",
  escalate: "To escalate: assign the conversation to the Payments team using the 'Conversation Actions' panel, set priority to High, and add the 'billing' tag for tracking.",
  refund: "For refund requests, verify the original transaction first using Transaction Lookup, then follow the refund SOP in the Knowledge Base under 'Payments > Refund Process'.",
}

function getResponse(q: string): string {
  const lower = q.toLowerCase()
  if (lower.includes('bonus')) return COPILOT_RESPONSES.bonus
  if (lower.includes('escalat')) return COPILOT_RESPONSES.escalate
  if (lower.includes('refund')) return COPILOT_RESPONSES.refund
  return COPILOT_RESPONSES.default
}

function CopilotPanel({ convo, compact = false }: { convo: Conversation; compact?: boolean }) {
  const [kbQuery, setKbQuery] = useState('')
  const [txnQuery, setTxnQuery] = useState('')
  const [txnResult, setTxnResult] = useState<null | 'found' | 'not-found'>(null)
  const [copilotTab, setCopilotTab] = useState<'ask' | 'tools'>('ask')
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Summary', 'Risk Analysis', 'Suggested Replies', 'Translation', 'Transaction Lookup']))
  const toggleSection = (section: string) => setExpandedSections(prev => {
    const next = new Set(prev)
    next.has(section) ? next.delete(section) : next.add(section)
    return next
  })

  const sp = compact ? 'text-sm' : 'text-xs'
  const sp2 = compact ? 'text-base' : 'text-sm'

  function sendMessage() {
    const text = prompt.trim()
    if (!text) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setPrompt('')
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: getResponse(text) }])
      setIsTyping(false)
    }, 900)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const riskFlags = convo.unknown
    ? [
        { color: 'text-amber-500', label: 'Identity unverified' },
        { color: 'text-amber-500', label: 'No account found by email' },
        { color: 'text-success', label: 'No prior chargebacks' },
      ]
    : [
        { color: 'text-success', label: 'Verified account' },
        { color: 'text-success', label: 'No prior chargebacks' },
        { color: convo.vip ? 'text-amber-500' : 'text-success', label: convo.vip ? 'VIP — escalate if unresolved' : 'No active restrictions' },
      ]

  const suggestions = convo.unknown
    ? [
        'To verify your identity, please provide the phone number linked to your account.',
        "I'll send a verification code to the phone number you provided. Please check your messages.",
        'For security reasons, I need to escalate this to our security team. They will contact you shortly.',
      ]
    : [
        'I can see your account details. Let me check the status of your bonus right now.',
        'Your request has been escalated to our Payments team. You will receive an update within 30 minutes.',
        'I completely understand your frustration. Let me look into this immediately.',
      ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Tab switcher */}
      <div className="flex shrink-0 border-b border-border">
        {(['ask', 'tools'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setCopilotTab(tab)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              copilotTab === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'ask' ? 'Ask Copilot' : 'Tools'}
          </button>
        ))}
      </div>

      {/* Ask tab — chat */}
      {copilotTab === 'ask' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 py-6 text-center px-2">
                <div>
                  <p className={cn(sp2, 'font-bold text-foreground leading-snug')}>Copilot is here to help.<br />Just ask.</p>
                </div>
                <div className="flex flex-col gap-3 w-full text-left">
                  {[
                    { icon: Rocket, text: 'Find answers by searching support content and past conversations.' },
                    { icon: Lightbulb, text: 'Figure out what to do using your team\'s internal articles.' },
                    { icon: Database, text: 'The more knowledge you add, the more expert Copilot becomes.' },
                    { icon: Lock, text: 'Copilot conversations are only visible to you.' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-2.5">
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="size-3 text-muted-foreground" />
                      </div>
                      <p className={cn(sp, 'text-muted-foreground leading-relaxed')}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0 mr-2 mt-0.5">
                        <Bot className="size-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className={cn(
                      sp, 'max-w-[85%] rounded-xl px-3 py-2 leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-foreground'
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Bot className="size-3 text-muted-foreground" />
                    </div>
                    <div className="bg-muted rounded-xl px-3 py-2 flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 p-3">
            <div className="flex items-end gap-1.5 rounded-xl border border-border bg-background px-3 py-2">
              <textarea
                rows={1}
                value={prompt}
                onChange={e => {
                  setPrompt(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask a question..."
                className={cn(sp, 'flex-1 bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground leading-relaxed max-h-40 overflow-y-auto')}
              />
              <button
                onClick={sendMessage}
                disabled={!prompt.trim()}
                className="size-6 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
              >
                <SendHorizonal className="size-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tools tab */}
      {copilotTab === 'tools' && (
      <div className="flex flex-col overflow-y-auto flex-1">

      {/* Summary */}
      <div className="border-b border-border">
        <button onClick={() => toggleSection('Summary')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <span className="text-sm font-medium text-foreground">Summary</span>
          {expandedSections.has('Summary') ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </button>
        {expandedSections.has('Summary') && (
          <div className="px-4 pb-3">
            <p className={cn(sp, 'text-muted-foreground leading-relaxed')}>
              {convo.unknown
                ? 'Unidentified user reporting account access issue. No matching record found. Identity verification required before any account action.'
                : 'Customer reports a pending issue related to their account. Conversation is ongoing. No resolution yet — agent follow-up needed.'}
            </p>
          </div>
        )}
      </div>

      {/* Risk analysis */}
      <div className="border-b border-border">
        <button onClick={() => toggleSection('Risk Analysis')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <span className="text-sm font-medium text-foreground">Risk Analysis</span>
          {expandedSections.has('Risk Analysis') ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </button>
        {expandedSections.has('Risk Analysis') && (
          <div className="px-4 pb-3 flex flex-col gap-1">
            {riskFlags.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={cn('size-1.5 rounded-full shrink-0', color === 'text-success' ? 'bg-success' : color === 'text-amber-500' ? 'bg-amber-500' : 'bg-destructive')} />
                <span className={cn(sp, 'text-muted-foreground')}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested replies */}
      <div className="border-b border-border">
        <button onClick={() => toggleSection('Suggested Replies')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <span className="text-sm font-medium text-foreground">Suggested Replies</span>
          <div className="flex items-center gap-2">
            <span onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="size-3.5" />
            </span>
            {expandedSections.has('Suggested Replies') ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
          </div>
        </button>
        {expandedSections.has('Suggested Replies') && (
          <div className="px-4 pb-3 flex flex-col gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className={cn(sp, 'text-left text-muted-foreground bg-background border border-border rounded-lg px-2.5 py-2 hover:border-brand hover:text-foreground transition-colors leading-relaxed')}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Translation */}
      <div className="border-b border-border">
        <button onClick={() => toggleSection('Translation')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <span className="text-sm font-medium text-foreground">Translation</span>
          {expandedSections.has('Translation') ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </button>
        {expandedSections.has('Translation') && (
          <div className="px-4 pb-3 flex items-center justify-between">
            <span className={cn(sp, 'text-muted-foreground')}>Detected: English</span>
            <button className={cn(sp, 'flex items-center gap-1 text-brand hover:underline')}>
              Translate <ChevronDown className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* Transaction lookup */}
      <div className="border-b border-border">
        <button onClick={() => toggleSection('Transaction Lookup')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <span className="text-sm font-medium text-foreground">Transaction Lookup</span>
          {expandedSections.has('Transaction Lookup') ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </button>
        {expandedSections.has('Transaction Lookup') && (
          <div className="px-4 pb-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg overflow-hidden">
              <input
                value={txnQuery}
                onChange={e => { setTxnQuery(e.target.value); setTxnResult(null) }}
                placeholder="Enter transaction ID..."
                className={cn(sp, 'flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground px-2.5 py-1.5')}
              />
              <button
                onClick={() => setTxnResult(txnQuery.length > 3 ? 'found' : 'not-found')}
                className="px-2.5 py-1.5 bg-muted text-muted-foreground hover:text-foreground transition-colors border-l border-border"
              >
                <ArrowRight className="size-3.5" />
              </button>
            </div>
            {txnResult === 'found' && (
              <div className={cn(sp, 'flex flex-col gap-1 text-muted-foreground')}>
                <div className="flex justify-between"><span>Type</span><span className="text-foreground">Deposit · Visa</span></div>
                <div className="flex justify-between"><span>Amount</span><span className="text-foreground">+$250.00</span></div>
                <div className="flex justify-between"><span>Status</span><span className="text-success font-medium">Completed</span></div>
                <div className="flex justify-between"><span>Date</span><span className="text-foreground">Jan 14, 2026</span></div>
              </div>
            )}
            {txnResult === 'not-found' && (
              <p className={cn(sp, 'text-destructive')}>Transaction not found.</p>
            )}
          </div>
        )}
      </div>

      </div>
      )}

    </div>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === 'urgent') return <AlertTriangle className="size-3.5 text-destructive shrink-0" />
  if (priority === 'high') return <BarChart2 className="size-3.5 text-amber-500 shrink-0" />
  return null
}

function ConversationItem({
  convo,
  isSelected,
  onClick,
}: {
  convo: Conversation
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 border-b border-border transition-colors hover:bg-muted/50',
        isSelected && 'bg-muted'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          'size-9 rounded-full flex items-center justify-center shrink-0 text-sm font-medium',
          isSelected
            ? 'bg-foreground text-background'
            : convo.unknown
              ? 'bg-muted border-2 border-dashed border-border text-muted-foreground'
              : 'bg-muted-foreground/20 text-muted-foreground'
        )}>
          {convo.unknown ? <UserX className="size-4" /> : convo.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Channel row */}
          <div className="flex items-center gap-2 mb-0.5 overflow-hidden">
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              {(() => { const Icon = CHANNEL_ICON_MAP[convo.channel]; return <Icon className="size-3 shrink-0" /> })()}
              {convo.channelLabel}
            </span>
            <div className="flex items-center gap-1 ml-auto shrink-0">
              {convo.assignee ? (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground max-w-[120px] truncate">
                  <User className="size-3 shrink-0" />
                  <span className="truncate">{convo.assignee}</span>
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-xs text-brand font-medium hover:underline">
                  <ChevronRight className="size-3 shrink-0" />Assign to me
                </span>
              )}
              {convo.priority && <PriorityBadge priority={convo.priority} />}
            </div>
          </div>
          {/* Name + time row */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 min-w-0">
              <span className={cn('text-sm truncate', convo.unread && 'font-medium', convo.unknown ? 'text-muted-foreground italic' : 'text-foreground')}>{convo.name}</span>
              {convo.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand" />}
              {convo.vip && <Crown className="size-3.5 shrink-0 text-amber-500" />}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">{convo.time}</span>
          </div>
          {/* Preview */}
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            {convo.isNote && <Lock className="size-3 shrink-0 text-muted-foreground" />}
            {convo.isReply && <Reply className="size-3 shrink-0 text-muted-foreground" />}
            <p className={cn('text-xs truncate min-w-0 flex-1', convo.unread ? 'text-foreground font-medium' : 'text-muted-foreground')}>{convo.preview}</p>
            {convo.unread && (
              <span className="ml-auto shrink-0 size-4 rounded-full bg-brand text-white text-xs flex items-center justify-center">
                {convo.unread}
              </span>
            )}
          </div>
          {/* Tags */}
          {convo.tags && convo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {convo.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'text-[11px] px-1.5 py-0.5 rounded border font-medium',
                    TAG_COLORS[tag] ?? 'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function AllConversationsContent() {
  const { open: appSidebarOpen, setOpen: setAppSidebarOpen } = useSidebar()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('mine')
  const [search, setSearch] = useState('')
  const [contactTab, setContactTab] = useState<'contact' | 'copilot'>('contact')
  const [replyTab, setReplyTab] = useState<'reply' | 'note'>('reply')
  const [replyHeight, setReplyHeight] = useState(40)
  const replyHeightRef = useRef(40)
  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = replyHeightRef.current
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(40, Math.min(400, startH + (startY - ev.clientY)))
      replyHeightRef.current = next
      setReplyHeight(next)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
  const onTouchDragStart = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY
    const startH = replyHeightRef.current
    const onMove = (ev: TouchEvent) => {
      const next = Math.max(40, Math.min(400, startH + (startY - ev.touches[0].clientY)))
      replyHeightRef.current = next
      setReplyHeight(next)
    }
    const onUp = () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
  }
  const [showSidebar, setShowSidebar] = useState(true)
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)
  const [compactFilterOpen, setCompactFilterOpen] = useState(false)
  const [compactSearchOpen, setCompactSearchOpen] = useState(false)
  const [listExpanded, setListExpanded] = useState(true)
  const [isWideScreen, setIsWideScreen] = useState(true)
  const [isMediumScreen, setIsMediumScreen] = useState(false)
  useEffect(() => {
    const mqWide = window.matchMedia('(min-width: 1200px)')
    const mqMed = window.matchMedia('(min-width: 768px) and (max-width: 930px)')
    const handleWide = (e: MediaQueryListEvent) => {
      setIsWideScreen(e.matches)
      if (!e.matches) setListExpanded(false)
    }
    const handleMed = (e: MediaQueryListEvent) => setIsMediumScreen(e.matches)
    setIsWideScreen(mqWide.matches)
    if (!mqWide.matches) setListExpanded(false)
    setIsMediumScreen(mqMed.matches)
    mqWide.addEventListener('change', handleWide)
    mqMed.addEventListener('change', handleMed)
    return () => {
      mqWide.removeEventListener('change', handleWide)
      mqMed.removeEventListener('change', handleMed)
    }
  }, [])

  // 768–930px: opening contact panel closes app sidebar and vice versa
  useEffect(() => {
    if (isMediumScreen && appSidebarOpen) {
      setShowSidebar(false)
    }
  }, [appSidebarOpen, isMediumScreen])

  const toggleDetails = () => {
    const next = !showSidebar
    setShowSidebar(next)
    if (next && isMediumScreen) setAppSidebarOpen(false)
  }
  const [status, setStatus] = useState<'open' | 'pending' | 'resolved' | 'spam'>('open')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showResolveWarning, setShowResolveWarning] = useState(false)
  const [convoLabels, setConvoLabels] = useState<string[]>([])
  const [showLabelMenu, setShowLabelMenu] = useState(false)
  const [labelSearch, setLabelSearch] = useState('')
  const labelSearchRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (showLabelMenu) labelSearchRef.current?.focus()
  }, [showLabelMenu])
  useEffect(() => {
    const found = CONVERSATIONS.find(c => c.id === selectedId)
    setConvoLabels(found?.labels ?? [])
  }, [selectedId])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Contact Attributes', 'Summary', 'Risk Analysis', 'Suggested Replies', 'Translation', 'Transaction Lookup']))
  const [convoPriority, setConvoPriority] = useState<'normal' | 'high' | 'critical'>('high')
  const toggleSection = (section: string) => setExpandedSections(prev => {
    const next = new Set(prev)
    next.has(section) ? next.delete(section) : next.add(section)
    return next
  })

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null

  const filtered = CONVERSATIONS.filter((c) => {
    if (activeTab === 'mine' && !MINE_IDS.has(c.id)) return false
    if (activeTab === 'unassigned' && !UNASSIGNED_IDS.has(c.id)) return false
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.ticketId.includes(q)
  })

  const selected = CONVERSATIONS.find((c) => c.id === selectedId)

  return (
    <>
      <DashboardHeader
          breadcrumbs={[
            { label: 'Bildery', href: '/dashboard' },
            { label: 'Conversations' },
            { label: 'All Conversations' },
          ]}
        />
        <div className="flex h-[calc(100vh-57px)] overflow-hidden">
          {/* Conversations panel */}
          {(() => {
            const isExpanded = isWideScreen && listExpanded
            return (
              <div className={cn(
                'shrink-0 flex flex-col border-r border-border transition-[width] duration-200',
                selectedId ? 'hidden md:flex' : 'flex w-full',
                isExpanded ? 'md:w-80' : 'md:w-14',
              )}>

                {/* ── COMPACT RAIL ── */}
                {!isExpanded && (
                  <div className="hidden md:flex flex-col h-full">
                    {/* Toggle expand button */}
                    <div className="flex justify-center py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!isWideScreen}
                        onClick={() => setListExpanded(true)}
                        title={isWideScreen ? 'Expand list' : 'Unavailable below 1200px'}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                    {/* Filter + Search */}
                    <div className="flex flex-col items-center gap-1 py-2 px-1 border-b border-border">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 relative"
                          onClick={() => { setCompactFilterOpen(o => !o); setCompactSearchOpen(false) }}
                        >
                          <SlidersHorizontal className="size-4" />
                          {activeTab !== 'all' && (
                            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand" />
                          )}
                        </Button>
                        {compactFilterOpen && (
                          <div className="absolute left-full ml-2 top-0 z-50 bg-popover border border-border rounded-lg shadow-md overflow-hidden min-w-[160px]">
                            {TABS.map((tab) => (
                              <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setCompactFilterOpen(false) }}
                                className={cn(
                                  'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted',
                                  activeTab === tab.key ? 'text-foreground font-medium' : 'text-muted-foreground'
                                )}
                              >
                                {tab.label}
                                <span className="text-xs opacity-70 ml-2">{tab.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 relative"
                          onClick={() => { setCompactSearchOpen(o => !o); setCompactFilterOpen(false) }}
                        >
                          <Search className="size-4" />
                          {search && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand" />}
                        </Button>
                        {compactSearchOpen && (
                          <div className="absolute left-full ml-2 top-0 z-50 bg-popover border border-border rounded-lg shadow-md p-2 w-56">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                              <Input
                                autoFocus
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-7 h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Avatar list */}
                    <div className="flex-1 overflow-y-auto py-1">
                      {filtered.map((convo) => (
                        <button
                          key={convo.id}
                          onClick={() => setSelectedId(convo.id)}
                          title={convo.name}
                          className={cn(
                            'w-full flex justify-center py-1.5',
                            selectedId === convo.id ? 'bg-muted' : 'hover:bg-muted/50'
                          )}
                        >
                          <div className="relative">
                            <div className={cn(
                              'size-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                              selectedId === convo.id
                                ? 'bg-foreground text-background'
                                : convo.unknown
                                  ? 'bg-muted border-2 border-dashed border-border text-muted-foreground'
                                  : 'bg-muted-foreground/20 text-muted-foreground'
                            )}>
                              {convo.unknown ? <UserX className="size-4" /> : convo.name.charAt(0)}
                            </div>
                            {convo.unread && convo.unread > 0 ? (
                              <span className="absolute -bottom-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-brand text-white text-xs flex items-center justify-center px-0.5">
                                {convo.unread}
                              </span>
                            ) : null}
                            {convo.vip && (
                              <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-background flex items-center justify-center">
                                <Crown className="size-2.5 text-amber-500" />
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── FULL PANEL ── */}
                {isExpanded && (
                  <div className="hidden md:flex flex-col flex-1 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 pt-3 pb-2">
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-base font-semibold text-foreground">Conversations</h2>
                        <Badge className="text-xs">Open</Badge>
                        {/* Collapse button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 ml-auto"
                          onClick={() => setListExpanded(false)}
                          title="Collapse list"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                      </div>
                      {/* Tabs */}
                      <div className="flex mb-3">
                        {TABS.map((tab, i) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-1.5 h-8 px-3 text-sm border border-border transition-colors',
                              i === 0 && 'rounded-l-lg',
                              i === TABS.length - 1 && 'rounded-r-lg',
                              i > 0 && '-ml-px',
                              activeTab === tab.key
                                ? 'bg-muted text-foreground font-medium z-10'
                                : 'bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            {tab.label}
                            <span className="text-xs opacity-70">{tab.count}</span>
                          </button>
                        ))}
                      </div>
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search conversations..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                    </div>
                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="flex flex-col">
                        {filtered.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No conversations found</p>
                        ) : (
                          filtered.map((convo) => (
                            <ConversationItem
                              key={convo.id}
                              convo={convo}
                              isSelected={selectedId === convo.id}
                              onClick={() => setSelectedId(convo.id)}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile full-width list (no selection) */}
                <div className="flex flex-col flex-1 overflow-hidden md:hidden">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-base font-semibold text-foreground">Conversations</h2>
                      <Badge className="text-xs">Open</Badge>
                    </div>
                    <div className="flex mb-3">
                      {TABS.map((tab, i) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 h-8 px-3 text-sm border border-border transition-colors',
                            i === 0 && 'rounded-l-lg',
                            i === TABS.length - 1 && 'rounded-r-lg',
                            i > 0 && '-ml-px',
                            activeTab === tab.key
                              ? 'bg-muted text-foreground font-medium z-10'
                              : 'bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          )}
                        >
                          {tab.label}
                          <span className="text-xs opacity-70">{tab.count}</span>
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                      {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No conversations found</p>
                      ) : (
                        filtered.map((convo) => (
                          <ConversationItem
                            key={convo.id}
                            convo={convo}
                            isSelected={selectedId === convo.id}
                            onClick={() => setSelectedId(convo.id)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )
          })()}

          {/* Main area */}
          {selected ? (
            <div className="flex-1 flex flex-col min-w-0 w-full md:w-auto">
              {/* Full-width header */}
              <div className="flex items-center px-3 py-3 border-b border-border shrink-0">
                {/* Back button — mobile only */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 md:hidden mr-1 shrink-0"
                  onClick={() => setSelectedId(null)}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-foreground leading-tight">{selected.name}</p>
                      {selected.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand" />}
                      {selected.vip && <Crown className="size-3.5 shrink-0 text-amber-500" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground font-mono">#{selected.ticketId}</span>
                        <Copy className="size-3 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => navigator.clipboard.writeText(selected.ticketId)} />
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <User className="size-3 text-muted-foreground" />
                      <button
                        onClick={() => setMobileProfileOpen(true)}
                        className="md:hidden text-xs text-brand hover:underline"
                      >
                        Open details
                      </button>
                      <button
                        onClick={() => toggleDetails()}
                        className="hidden md:block text-xs text-brand hover:underline"
                      >
                        {showSidebar ? 'Close details' : 'Open details'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <Button variant="ghost" size="icon" className="size-8"><BellOff className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8"><Share2 className="size-4" /></Button>
                  <div className="relative">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                    >
                      {status === 'open' ? 'Open' : status === 'pending' ? 'Pending' : status === 'spam' ? 'Junk' : 'Resolved'}
                      <ChevronDown className="size-3" />
                    </Button>
                    {showStatusMenu && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-md overflow-hidden min-w-[120px]">
                        {([
                          { key: 'open', label: 'Open' },
                          { key: 'pending', label: 'Pending' },
                          { key: 'resolved', label: 'Resolved' },
                          { key: 'spam', label: 'Junk' },
                        ] as const).map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => {
                              if (key === 'resolved' && convoLabels.length === 0) {
                                setShowStatusMenu(false)
                                setShowResolveWarning(true)
                              } else {
                                setStatus(key)
                                setShowStatusMenu(false)
                              }
                            }}
                            className={cn(
                              'w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors',
                              status === key ? 'text-foreground font-medium' : 'text-muted-foreground'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                    {showResolveWarning && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg p-4 w-64">
                        <p className="text-sm font-medium text-foreground mb-1">No label added</p>
                        <p className="text-xs text-muted-foreground mb-3">Adding a label helps track conversation topics. You can still resolve without one.</p>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setStatus('resolved'); setShowResolveWarning(false) }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Resolve anyway
                          </button>
                          <button
                            onClick={() => setShowResolveWarning(false)}
                            className="text-xs font-medium text-brand hover:underline"
                          >
                            Add label
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Body: chat + sidebar */}
              <div className="flex flex-1 min-h-0">
              {/* Chat column */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-border relative">

                {/* Sidebar toggle button — desktop only */}
                <button
                  onClick={() => toggleDetails()}
                  className="hidden md:flex absolute right-0 top-24 -translate-y-1/2 translate-x-1/2 z-10 size-6 rounded-full bg-foreground border border-border items-center justify-center shadow-sm hover:bg-foreground/80 transition-colors"
                >
                  {showSidebar
                    ? <ChevronRight className="size-3 text-background" />
                    : <ChevronRight className="size-3 text-background rotate-180" />
                  }
                </button>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 flex flex-col gap-4">
                  {(CONVERSATION_MESSAGES[selected.id] ?? CONVERSATION_MESSAGES['1']).map((msg, i) => {
                    if (msg.from === 'system') return (
                      <div key={i} className="flex justify-center">
                        <p className="text-xs text-muted-foreground">{msg.text}</p>
                      </div>
                    )
                    if (msg.from === 'user') return (
                      <div key={i} className="flex gap-3 max-w-[70%]">
                        <div className="size-7 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0 mt-1">{selected.name.charAt(0)}</div>
                        <div>
                          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                            <p className="text-sm text-foreground">{msg.text}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-1">{msg.time}</p>
                        </div>
                      </div>
                    )
                    return (
                      <div key={i} className="flex gap-3 max-w-[70%] self-end flex-row-reverse">
                        <div className="size-7 rounded-full bg-brand/20 flex items-center justify-center text-xs font-medium text-brand shrink-0 mt-1">M</div>
                        <div>
                          <div className="bg-brand text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 mr-1 text-right">{msg.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Reply input */}
                <div className="shrink-0 p-3 select-none overflow-hidden">
                  {/* Drag handle */}
                  <div
                    onMouseDown={onDragStart}
                    onTouchStart={onTouchDragStart}
                    className="flex justify-center items-center h-5 mb-1 cursor-row-resize group touch-none"
                  >
                    <div className="w-10 h-0.5 rounded-full bg-border group-hover:bg-muted-foreground/40 transition-colors" />
                  </div>
                  {/* Input box */}
                  <div className={cn(
                    'rounded-2xl border border-border flex flex-col',
                    replyTab === 'note' && 'bg-amber-50/50 dark:bg-amber-900/10'
                  )}>
                    {/* Tabs + AI row — inside the box */}
                    <div className="flex items-center gap-2 px-3 pt-3">
                      <div className="flex items-center bg-muted rounded-lg p-0.5">
                        <button
                          onClick={() => setReplyTab('reply')}
                          className={cn(
                            'px-3 py-1 text-sm rounded-md transition-all',
                            replyTab === 'reply'
                              ? 'bg-background text-foreground font-medium shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >Reply</button>
                        <button
                          onClick={() => setReplyTab('note')}
                          className={cn(
                            'px-3 py-1 text-sm rounded-md transition-all',
                            replyTab === 'note'
                              ? 'bg-background text-foreground font-medium shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >Private Note</button>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-muted text-brand">
                          <Sparkles className="size-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                          <Maximize2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    {/* Text area */}
                    <textarea
                      placeholder="Write a message…"
                      className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none overflow-auto"
                      style={{ height: replyHeight }}
                    />
                    {/* Bottom toolbar */}
                    <div className="flex items-center px-3 pb-3">
                      <div className="flex gap-0.5">
                        {[Smile, Paperclip, Mic].map((Icon, i) => (
                          <button key={i} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                            <Icon className="size-4" />
                          </button>
                        ))}
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        Use <KbdGroup><Kbd>⌘ + ↵</Kbd></KbdGroup> to send message
                      </span>
                      <Button size="sm" className="h-8 ml-2">Send</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact sidebar */}
              {showSidebar && <div className="w-72 shrink-0 hidden md:flex flex-col overflow-y-auto">
                {/* Contact / Copilot tabs */}
                <div className="p-2 shrink-0">
                  <div className="flex items-center bg-muted rounded-lg p-0.5">
                    {(['contact', 'copilot'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setContactTab(tab)}
                        className={cn(
                          'flex-1 py-1 text-sm font-medium rounded-md transition-all capitalize',
                          contactTab === tab
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {contactTab === 'contact' ? (
                  <>
                    {/* Avatar + name */}
                    <div className="flex flex-col items-center pt-4 pb-4 px-4 border-b border-border">
                      {selected.unknown ? (
                        <div className="size-14 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center mb-3">
                          <UserX className="size-6 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="size-14 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xl font-semibold text-muted-foreground mb-3">
                          {selected.name.charAt(0)}
                        </div>
                      )}
                      <div className="relative flex items-center justify-center">
                        <p className={cn('text-sm font-semibold', selected.unknown ? 'text-muted-foreground italic' : 'text-foreground')}>{selected.name}</p>
                        {!selected.unknown && (selected.verified || selected.vip) && (
                          <div className="absolute left-full ml-1 flex items-center gap-0.5">
                            {selected.verified && <BadgeCheck className="size-3.5 text-brand" />}
                            {selected.vip && <Crown className="size-3.5 text-amber-500" />}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-muted-foreground font-mono">Ticket #{selected.ticketId}</span>
                        <Copy className="size-3 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => navigator.clipboard.writeText(selected.ticketId)} />
                      </div>
                      {selected.unknown ? (
                        <>
                          <p className="text-xs text-muted-foreground mt-0.5 text-center">No user information available</p>
                          <div className="w-full mt-4 flex flex-col gap-2">
                            <p className="text-xs font-medium text-muted-foreground">Identify user</p>
                            {[
                              { icon: User, placeholder: 'User ID', type: 'text' },
                              { icon: Mail, placeholder: 'Email address', type: 'email' },
                              { icon: Phone, placeholder: 'Phone number', type: 'tel' },
                            ].map(({ icon: Icon, placeholder, type }) => (
                              <div key={placeholder} className="flex items-center gap-2 bg-muted rounded-lg px-2.5 py-1.5">
                                <Icon className="size-3.5 text-muted-foreground shrink-0" />
                                <input type={type} placeholder={placeholder} className="text-xs bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
                              </div>
                            ))}
                            <button className="mt-1 w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-foreground text-background rounded-[min(var(--radius-md),12px)] py-1.5 hover:bg-foreground/90 transition-colors">
                              Send verification code
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground mt-0.5">Gold customer</p>
                          <div className="w-full mt-3 flex flex-col gap-1.5">
                            {[
                              { icon: User, text: 'USR-48291673' },
                              { icon: Mail, text: 'kcrawley6@driftburner.inc' },
                              { icon: Phone, text: '+4915172470150' },
                              { icon: MapPin, text: 'Berlin, Germany' },
                            ].map(({ icon: Icon, text }) => (
                              <div key={text} className="flex items-center gap-2">
                                <Icon className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="text-xs text-muted-foreground truncate">{text}</span>
                                <Copy className="size-3 text-muted-foreground ml-auto shrink-0 cursor-pointer hover:text-foreground" />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                              <button key={i} className="size-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground">
                                <Icon className="size-3.5" />
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        {[
                          { icon: MessageSquare, label: 'Message' },
                          { icon: Pencil, label: 'Edit' },
                          { icon: PhoneCall, label: 'Call' },
                          { icon: ShieldBan, label: 'Block deposits & withdrawals', warn: true },
                        ].map(({ icon: Icon, label, warn }) => (
                          <button
                            key={label}
                            title={label}
                            className={cn(
                              'size-8 rounded-full flex items-center justify-center',
                              warn
                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                            )}
                          >
                            <Icon className="size-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Collapsible sections */}
                    {[
                      'Contact Attributes',
                      'Conversation Actions',
                      'Conversation Participants',
                      'Macros',
                      'Session Details',
                      'Previous Conversations',
                    ].map((section) => {
                      const isExpanded = expandedSections.has(section)
                      return (
                        <div key={section} className="border-b border-border">
                          <button
                            onClick={() => toggleSection(section)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm font-medium text-foreground">{section}</span>
                            {isExpanded
                              ? <ChevronDown className="size-4 text-muted-foreground" />
                              : <ChevronRight className="size-4 text-muted-foreground" />
                            }
                          </button>
                          {isExpanded && section === 'Contact Attributes' && (
                            <div className="px-4 pb-4 flex flex-col gap-4">
                              {/* Account status */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Status</span>
                                {selected.unknown
                                  ? <span className="text-xs text-muted-foreground">—</span>
                                  : <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success-bg text-success"><ShieldCheck className="size-3" />Active</span>
                                }
                              </div>

                              {/* Balances */}
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Balances</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleDollarSign className="size-3.5" />Real money</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '$1,240.00'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gift className="size-3.5" />Bonus</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '$180.00'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />Pending withdrawal</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '$500.00'}</span>
                                </div>
                                <div className="pt-2 border-t border-border flex items-center justify-around">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-sm font-medium text-foreground">{selected.unknown ? '—' : '$24,300'}</span>
                                    <span className="text-xs text-muted-foreground">Deposits</span>
                                    <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '47 times'}</span>
                                  </div>
                                  <div className="w-px h-10 bg-border" />
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-sm font-medium text-foreground">{selected.unknown ? '—' : '$19,750'}</span>
                                    <span className="text-xs text-muted-foreground">Withdrawals</span>
                                    <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '31 times'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Last transaction */}
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Last Transaction</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CreditCard className="size-3.5" />{selected.unknown ? 'Unknown' : 'Deposit · Visa'}</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '+$500'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : 'Jan 14, 2026'}</span>
                                  {!selected.unknown && <span className="text-xs px-1.5 py-0.5 rounded-full bg-success-bg text-success">Completed</span>}
                                </div>
                              </div>

                              {/* Active bonus */}
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Active Bonus</p>
                                {selected.unknown ? (
                                  <span className="text-xs text-muted-foreground">—</span>
                                ) : (
                                  <>
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Flame className="size-3.5 text-amber-500" />100% Deposit Bonus</span>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">Wagered</span>
                                      <span className="text-xs text-foreground">$340 / $500</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-muted-foreground/20">
                                      <div className="h-1.5 rounded-full bg-amber-500" style={{width: '68%'}} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">Expires Jan 20, 2026</span>
                                  </>
                                )}
                              </div>

                              {/* KYC & Account */}
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">KYC & Account</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />Verification</span>
                                  {selected.unknown
                                    ? <span className="text-xs text-muted-foreground">—</span>
                                    : <span className="text-xs px-1.5 py-0.5 rounded-full bg-success-bg text-success">Verified</span>
                                  }
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="size-3.5" />VIP Level</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : 'Gold'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />Registered</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : 'Mar 5, 2023'}</span>
                                </div>
                              </div>

                              {/* Last activity */}
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Last Activity</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><LogIn className="size-3.5" />Last login</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : 'Today, 11:42 AM'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gamepad2 className="size-3.5" />Last game</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : 'Book of Dead'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" />Location</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : 'DE · Berlin'}</span>
                                </div>
                              </div>

                              {/* Limits */}
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Limits & Restrictions</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleDollarSign className="size-3.5" />Daily deposit</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '$500 / day'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Timer className="size-3.5" />Session limit</span>
                                  <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '3h / session'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleAlert className="size-3.5" />Self-exclusion</span>
                                  {selected.unknown
                                    ? <span className="text-xs text-muted-foreground">—</span>
                                    : <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">None</span>
                                  }
                                </div>
                              </div>
                            </div>
                          )}
                          {isExpanded && section === 'Conversation Participants' && (
                            <div className="px-4 pb-4 flex flex-col gap-3">
                              {/* Current participants */}
                              <div className="flex flex-col gap-2">
                                {[
                                  { name: 'David Wallace', role: 'Assignee' },
                                  { name: 'Sarah Connor', role: 'Supervisor' },
                                ].map(({ name, role }) => (
                                  <div key={name} className="flex items-center gap-2">
                                    <div className="size-7 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                                      {name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-foreground">{name}</p>
                                      <p className="text-xs text-muted-foreground">{role}</p>
                                    </div>
                                    {role !== 'Assignee' && (
                                      <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {/* Add participant */}
                              <button className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                                <Plus className="size-3.5" />Add participant
                              </button>
                            </div>
                          )}
                          {isExpanded && section === 'Macros' && (
                            <div className="px-4 pb-4 flex flex-col gap-2">
                              <div className="rounded-xl border border-border p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-foreground">Escalate to Payments</span>
                                  <Button size="sm" variant="outline" className="h-6 text-[11px] px-2">Run</Button>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {[
                                    'Send: "Your case has been escalated to our Payments team."',
                                    'Assign team: Payments & Withdrawals',
                                    'Set priority: High',
                                    'Add label: payment-issue',
                                  ].map((action) => (
                                    <p key={action} className="text-xs text-muted-foreground flex items-start gap-1">
                                      <span className="mt-0.5 shrink-0">·</span>{action}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {isExpanded && section === 'Session Details' && (
                            <div className="px-4 pb-4 flex flex-col gap-2">
                              {[
                                { icon: Globe, label: 'Page URL', value: '/casino/slots/book-of-dead' },
                                { icon: Settings, label: 'Browser', value: 'Chrome 121 · macOS' },
                                { icon: MapPin, label: 'IP', value: '85.214.132.117 · DE' },
                                { icon: Tag, label: 'UTM Source', value: 'google / cpc' },
                                { icon: Tag, label: 'UTM Campaign', value: 'slots-promo-jan26' },
                                { icon: Copy, label: 'Session ID', value: 'sess_8x92kA3' },
                                { icon: Clock, label: 'Wait time', value: '1m 24s' },
                              ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start justify-between gap-2">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0"><Icon className="size-3.5" />{label}</span>
                                  <span className="text-xs text-foreground text-right truncate max-w-[140px]">{value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {isExpanded && section === 'Previous Conversations' && (
                            <div className="px-4 pb-3 flex flex-col gap-2">
                              {selected.unknown ? (
                                <p className="text-xs text-muted-foreground">—</p>
                              ) : PREV_CONVERSATIONS.map((prev) => {
                                const Icon = CHANNEL_ICON_MAP[prev.channel]
                                return (
                                  <button
                                    key={prev.id}
                                    className="w-full text-left flex items-start gap-3 rounded-xl bg-muted p-3 hover:bg-muted-foreground/10 transition-colors"
                                  >
                                    <div className="size-7 rounded-full bg-background flex items-center justify-center shrink-0 mt-0.5">
                                      <Icon className="size-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-foreground truncate">{prev.preview}</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-xs text-muted-foreground">{prev.date}</span>
                                        <span className={cn(
                                          'text-xs px-1.5 py-0.5 rounded-full',
                                          prev.status === 'resolved'
                                            ? 'bg-success-bg text-success'
                                            : 'bg-brand-bg text-brand'
                                        )}>
                                          {prev.status === 'resolved' ? 'Resolved' : 'Open'}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                          {isExpanded && section === 'Conversation Actions' && (
                            <div className="px-4 pb-4 flex flex-col gap-3">
                              {/* Assigned Agent */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-medium text-muted-foreground">Assigned Agent</span>
                                  <button className="text-xs text-brand hover:underline flex items-center gap-0.5">
                                    <ChevronRight className="size-3" />Assign to me
                                  </button>
                                </div>
                                <Select defaultValue="david">
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[
                                      { value: 'david', name: 'David Wallace' },
                                      { value: 'sarah', name: 'Sarah Connor' },
                                      { value: 'james', name: 'James Holden' },
                                      { value: 'nina', name: 'Nina Petrova' },
                                      { value: 'omar', name: 'Omar Khalid' },
                                      { value: 'lia', name: 'Lia Nakamura' },
                                    ].map(({ value, name }) => (
                                      <SelectItem key={value} value={value}>
                                        <span className="flex items-center gap-2">
                                          <div className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                                            {name.charAt(0)}
                                          </div>
                                          {name}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Assigned Team */}
                              <div>
                                <span className="text-xs font-medium text-muted-foreground block mb-1.5">Assigned Team</span>
                                <Select defaultValue="technical">
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[
                                      { value: 'technical', name: 'Technical Support' },
                                      { value: 'vip', name: 'VIP Support' },
                                      { value: 'payments', name: 'Payments & Withdrawals' },
                                      { value: 'fraud', name: 'Fraud & Security' },
                                      { value: 'success', name: 'Customer Success' },
                                    ].map(({ value, name }) => (
                                      <SelectItem key={value} value={value}>
                                        <span className="flex items-center gap-2">
                                          <div className="size-5 rounded-full bg-success-bg flex items-center justify-center shrink-0">
                                            <Wrench className="size-3 text-success" />
                                          </div>
                                          {name}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Priority */}
                              <div>
                                <span className="text-xs font-medium text-muted-foreground block mb-1.5">Priority</span>
                                <Select value={convoPriority} onValueChange={(v) => setConvoPriority(v as typeof convoPriority)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue>
                                      <span className="flex items-center gap-2">
                                        {convoPriority === 'normal' && <Minus className="size-4 text-muted-foreground" />}
                                        {convoPriority === 'high' && <BarChart2 className="size-4 text-amber-500" />}
                                        {convoPriority === 'critical' && <AlertTriangle className="size-4 text-destructive" />}
                                        {convoPriority === 'normal' ? 'Normal' : convoPriority === 'high' ? 'High' : 'Critical'}
                                      </span>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="normal">
                                      <span className="flex items-center gap-2">
                                        <Minus className="size-4 text-muted-foreground" />Normal
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="high">
                                      <span className="flex items-center gap-2">
                                        <BarChart2 className="size-4 text-amber-500" />High
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="critical">
                                      <span className="flex items-center gap-2">
                                        <AlertTriangle className="size-4 text-destructive" />Critical
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Conversation Labels */}
                              <div>
                                <span className="text-xs font-medium text-muted-foreground block mb-1.5">Conversation Labels</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <div className="relative">
                                    <button
                                      onClick={() => { setShowLabelMenu(v => !v); setLabelSearch(''); setTimeout(() => labelSearchRef.current?.focus(), 0) }}
                                      className="flex items-center gap-1 text-xs text-brand hover:underline"
                                    >
                                      <Plus className="size-3" />Add Labels
                                    </button>
                                    {showLabelMenu && (
                                      <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg w-52 overflow-hidden">
                                        <div className="p-2 border-b border-border">
                                          <input
                                            ref={labelSearchRef}
                                            autoFocus
                                            value={labelSearch}
                                            onChange={e => setLabelSearch(e.target.value)}
                                            placeholder="Search labels..."
                                            className="w-full text-xs bg-muted rounded-lg px-2.5 py-1.5 outline-none text-foreground placeholder:text-muted-foreground"
                                            onKeyDown={e => {
                                              if (e.key === 'Enter' && labelSearch.trim() && !convoLabels.includes(labelSearch.trim())) {
                                                setConvoLabels(prev => [...prev, labelSearch.trim()])
                                                setLabelSearch('')
                                                setShowLabelMenu(false)
                                              }
                                            }}
                                          />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto py-1">
                                          {ALL_LABELS
                                            .filter(l => l.includes(labelSearch.toLowerCase()))
                                            .map(lbl => {
                                              const active = convoLabels.includes(lbl)
                                              return (
                                                <button
                                                  key={lbl}
                                                  onClick={() => {
                                                    setConvoLabels(prev => active ? prev.filter(l => l !== lbl) : [...prev, lbl])
                                                  }}
                                                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                                                >
                                                  <span className={cn(
                                                    'px-1.5 py-0.5 rounded border',
                                                    TAG_COLORS[lbl] ?? 'bg-muted text-muted-foreground border-border'
                                                  )}>{lbl}</span>
                                                  {active && <Check className="size-3 text-brand shrink-0" />}
                                                </button>
                                              )
                                            })
                                          }
                                          {ALL_LABELS.filter(l => l.includes(labelSearch.toLowerCase())).length === 0 && (
                                            <p className="px-3 py-2 text-xs text-muted-foreground">No labels found</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {convoLabels.map(lbl => (
                                    <span key={lbl} className={cn('flex items-center gap-1 text-xs border rounded px-1.5 py-0.5', TAG_COLORS[lbl] ?? 'bg-muted text-muted-foreground border-border')}>
                                      {lbl}
                                      <button onClick={() => setConvoLabels(prev => prev.filter(l => l !== lbl))} className="hover:opacity-70"><X className="size-3" /></button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <CopilotPanel convo={selected} />
                )}
              </div>}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                  <MessageSquare className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">Select a conversation</p>
                  <p className="text-sm text-muted-foreground mt-1">Choose a conversation from the list to open it.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      {/* Mobile profile drawer */}
      <Drawer open={mobileProfileOpen} onOpenChange={setMobileProfileOpen}>
        <DrawerContent className="max-h-[90dvh]">
          <DrawerHeader className="border-b border-border pb-3">
            <DrawerTitle>{selected?.name ?? 'Contact'}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">
            {/* Contact / Copilot tabs */}
            <div className="p-2 shrink-0">
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                {(['contact', 'copilot'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setContactTab(tab)}
                    className={cn(
                      'flex-1 py-1 text-sm font-medium rounded-md transition-all capitalize',
                      contactTab === tab
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {contactTab === 'contact' && selected ? (
              <>
                {/* Avatar + name */}
                <div className="flex flex-col items-center pt-4 pb-4 px-4 border-b border-border">
                  {selected.unknown ? (
                    <div className="size-14 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center mb-3">
                      <UserX className="size-6 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="size-14 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xl font-semibold text-muted-foreground mb-3">
                      {selected.name.charAt(0)}
                    </div>
                  )}
                  <div className="relative flex items-center justify-center">
                    <p className={cn('text-base font-semibold', selected.unknown ? 'text-muted-foreground italic' : 'text-foreground')}>{selected.name}</p>
                    {!selected.unknown && (selected.verified || selected.vip) && (
                      <div className="absolute left-full ml-1 flex items-center gap-0.5">
                        {selected.verified && <BadgeCheck className="size-4 text-brand" />}
                        {selected.vip && <Crown className="size-4 text-amber-500" />}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">#{selected.ticketId}</p>
                  {selected.unknown ? (
                    <>
                      <p className="text-sm text-muted-foreground mt-0.5 text-center">No user information available</p>
                      <div className="w-full mt-4 flex flex-col gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Identify user</p>
                        {[
                          { icon: User, placeholder: 'User ID', type: 'text' },
                          { icon: Mail, placeholder: 'Email address', type: 'email' },
                          { icon: Phone, placeholder: 'Phone number', type: 'tel' },
                        ].map(({ icon: Icon, placeholder, type }) => (
                          <div key={placeholder} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                            <Icon className="size-4 text-muted-foreground shrink-0" />
                            <input type={type} placeholder={placeholder} className="text-sm bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
                          </div>
                        ))}
                        <button className="mt-1 w-full flex items-center justify-center gap-1.5 text-sm font-medium bg-foreground text-background rounded-[min(var(--radius-md),12px)] py-2 hover:bg-foreground/90 transition-colors">
                          Send verification code
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mt-0.5">Gold customer</p>
                      <div className="w-full mt-3 flex flex-col gap-2">
                        {[
                          { icon: User, text: 'USR-48291673' },
                          { icon: Mail, text: 'kcrawley6@driftburner.inc' },
                          { icon: Phone, text: '+14155552398' },
                          { icon: MapPin, text: 'San Francisco, United States' },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} className="flex items-center gap-2">
                            <Icon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground truncate">{text}</span>
                            <Copy className="size-3.5 text-muted-foreground ml-auto shrink-0 cursor-pointer hover:text-foreground" />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                          <button key={i} className="size-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground">
                            <Icon className="size-4" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 mt-3">
                    {[
                      { icon: MessageSquare, label: 'Message' },
                      { icon: Pencil, label: 'Edit' },
                      { icon: PhoneCall, label: 'Call' },
                      { icon: ShieldBan, label: 'Block deposits & withdrawals', warn: true },
                    ].map(({ icon: Icon, label, warn }) => (
                      <button
                        key={label}
                        title={label}
                        className={cn(
                          'size-9 rounded-full flex items-center justify-center',
                          warn
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                            : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Collapsible sections */}
                {[
                  'Contact Attributes',
                  'Conversation Actions',
                  'Conversation Participants',
                  'Macros',
                  'Session Details',
                  'Previous Conversations',
                ].map((section) => {
                  const isExpanded = expandedSections.has(section)
                  return (
                    <div key={section} className="border-b border-border">
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-base font-medium text-foreground">{section}</span>
                        {isExpanded
                          ? <ChevronDown className="size-4 text-muted-foreground" />
                          : <ChevronRight className="size-4 text-muted-foreground" />
                        }
                      </button>
                      {isExpanded && section === 'Contact Attributes' && (
                        <div className="px-4 pb-4 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            {selected.unknown
                              ? <span className="text-sm text-muted-foreground">—</span>
                              : <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success-bg text-success"><ShieldCheck className="size-3" />Active</span>}
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Balances</p>
                            {[
                              { icon: CircleDollarSign, label: 'Real money', value: selected.unknown ? '—' : '$1,240.00' },
                              { icon: Gift, label: 'Bonus', value: selected.unknown ? '—' : '$180.00' },
                              { icon: Clock, label: 'Pending withdrawal', value: selected.unknown ? '—' : '$500.00' },
                            ].map(({ icon: Icon, label, value }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="size-4" />{label}</span>
                                <span className="text-sm text-foreground">{value}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-border flex items-center justify-around">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-base font-medium text-foreground">{selected.unknown ? '—' : '$24,300'}</span>
                                <span className="text-xs text-muted-foreground">Deposits</span>
                                <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '47 times'}</span>
                              </div>
                              <div className="w-px h-10 bg-border" />
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-base font-medium text-foreground">{selected.unknown ? '—' : '$19,750'}</span>
                                <span className="text-xs text-muted-foreground">Withdrawals</span>
                                <span className="text-xs text-muted-foreground">{selected.unknown ? '—' : '31 times'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Last Transaction</p>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><CreditCard className="size-4" />{selected.unknown ? 'Unknown' : 'Deposit · Visa'}</span>
                              <span className="text-sm text-foreground">{selected.unknown ? '—' : '+$500'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{selected.unknown ? '—' : 'Jan 14, 2026'}</span>
                              {!selected.unknown && <span className="text-xs px-1.5 py-0.5 rounded-full bg-success-bg text-success">Completed</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Active Bonus</p>
                            {selected.unknown ? (
                              <span className="text-sm text-muted-foreground">—</span>
                            ) : (
                              <>
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Flame className="size-4 text-amber-500" />100% Deposit Bonus</span>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Wagered</span>
                                  <span className="text-sm text-foreground">$340 / $500</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-muted-foreground/20">
                                  <div className="h-1.5 rounded-full bg-amber-500" style={{width: '68%'}} />
                                </div>
                                <span className="text-xs text-muted-foreground">Expires Jan 20, 2026</span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">KYC & Account</p>
                            {[
                              { icon: ShieldCheck, label: 'Verification', badge: selected.unknown ? undefined : 'Verified', badgeClass: 'bg-success-bg text-success', value: selected.unknown ? '—' : undefined },
                              { icon: TrendingUp, label: 'VIP Level', value: selected.unknown ? '—' : 'Gold' },
                              { icon: Clock, label: 'Registered', value: selected.unknown ? '—' : 'Mar 5, 2023' },
                            ].map(({ icon: Icon, label, badge, badgeClass, value }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="size-4" />{label}</span>
                                {badge
                                  ? <span className={cn('text-xs px-1.5 py-0.5 rounded-full', badgeClass)}>{badge}</span>
                                  : <span className="text-sm text-foreground">{value}</span>}
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Last Activity</p>
                            {[
                              { icon: LogIn, label: 'Last login', value: selected.unknown ? '—' : 'Today, 11:42 AM' },
                              { icon: Gamepad2, label: 'Last game', value: selected.unknown ? '—' : 'Book of Dead' },
                              { icon: MapPin, label: 'Location', value: selected.unknown ? '—' : 'DE · Berlin' },
                            ].map(({ icon: Icon, label, value }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="size-4" />{label}</span>
                                <span className="text-sm text-foreground">{value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Limits & Restrictions</p>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><CircleDollarSign className="size-4" />Daily deposit</span>
                              <span className="text-sm text-foreground">{selected.unknown ? '—' : '$500 / day'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Timer className="size-4" />Session limit</span>
                              <span className="text-sm text-foreground">{selected.unknown ? '—' : '3h / session'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><CircleAlert className="size-4" />Self-exclusion</span>
                              {selected.unknown
                                ? <span className="text-sm text-muted-foreground">—</span>
                                : <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">None</span>}
                            </div>
                          </div>
                        </div>
                      )}
                      {isExpanded && section === 'Conversation Participants' && (
                        <div className="px-4 pb-4 flex flex-col gap-3">
                          <div className="flex flex-col gap-2">
                            {[
                              { name: 'David Wallace', role: 'Assignee' },
                              { name: 'Sarah Connor', role: 'Supervisor' },
                            ].map(({ name, role }) => (
                              <div key={name} className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                                  {name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground">{name}</p>
                                  <p className="text-xs text-muted-foreground">{role}</p>
                                </div>
                                {role !== 'Assignee' && (
                                  <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remove</button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button className="flex items-center gap-1.5 text-sm text-brand hover:underline">
                            <Plus className="size-4" />Add participant
                          </button>
                        </div>
                      )}
                      {isExpanded && section === 'Macros' && (
                        <div className="px-4 pb-4 flex flex-col gap-2">
                          <div className="rounded-xl border border-border p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">Escalate to Payments</span>
                              <Button size="sm" variant="outline" className="h-7 text-xs px-2">Run</Button>
                            </div>
                            <div className="flex flex-col gap-1">
                              {[
                                'Send: "Your case has been escalated to our Payments team."',
                                'Assign team: Payments & Withdrawals',
                                'Set priority: High',
                                'Add label: payment-issue',
                              ].map((action) => (
                                <p key={action} className="text-xs text-muted-foreground flex items-start gap-1">
                                  <span className="mt-0.5 shrink-0">·</span>{action}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {isExpanded && section === 'Session Details' && (
                        <div className="px-4 pb-4 flex flex-col gap-2">
                          {[
                            { icon: Globe, label: 'Page URL', value: '/casino/slots/book-of-dead' },
                            { icon: Settings, label: 'Browser', value: 'Chrome 121 · macOS' },
                            { icon: MapPin, label: 'IP', value: '85.214.132.117 · DE' },
                            { icon: Tag, label: 'UTM Source', value: 'google / cpc' },
                            { icon: Tag, label: 'UTM Campaign', value: 'slots-promo-jan26' },
                            { icon: Copy, label: 'Session ID', value: 'sess_8x92kA3' },
                            { icon: Clock, label: 'Wait time', value: '1m 24s' },
                          ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start justify-between gap-2">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0"><Icon className="size-4" />{label}</span>
                              <span className="text-sm text-foreground text-right truncate max-w-[160px]">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {isExpanded && section === 'Previous Conversations' && (
                        <div className="px-4 pb-3 flex flex-col gap-2">
                          {selected.unknown ? (
                            <p className="text-sm text-muted-foreground">—</p>
                          ) : PREV_CONVERSATIONS.map((prev) => {
                            const Icon = CHANNEL_ICON_MAP[prev.channel]
                            return (
                              <button
                                key={prev.id}
                                className="w-full text-left flex items-start gap-3 rounded-xl bg-muted p-3 hover:bg-muted-foreground/10 transition-colors"
                              >
                                <div className="size-8 rounded-full bg-background flex items-center justify-center shrink-0 mt-0.5">
                                  <Icon className="size-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground truncate">{prev.preview}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-sm text-muted-foreground">{prev.date}</span>
                                    <span className={cn(
                                      'text-xs px-1.5 py-0.5 rounded-full',
                                      prev.status === 'resolved' ? 'bg-success-bg text-success' : 'bg-brand-bg text-brand'
                                    )}>
                                      {prev.status === 'resolved' ? 'Resolved' : 'Open'}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {isExpanded && section === 'Conversation Actions' && (
                        <div className="px-4 pb-4 flex flex-col gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-muted-foreground">Assigned Agent</span>
                              <button className="text-sm text-brand hover:underline flex items-center gap-0.5">
                                <ChevronRight className="size-3.5" />Assign to me
                              </button>
                            </div>
                            <Select defaultValue="david">
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {[
                                  { value: 'david', name: 'David Wallace' },
                                  { value: 'sarah', name: 'Sarah Connor' },
                                  { value: 'james', name: 'James Holden' },
                                ].map(({ value, name }) => (
                                  <SelectItem key={value} value={value}>{name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground block mb-1.5">Assigned Team</span>
                            <Select defaultValue="technical">
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {[
                                  { value: 'technical', name: 'Technical Support' },
                                  { value: 'vip', name: 'VIP Support' },
                                  { value: 'payments', name: 'Payments & Withdrawals' },
                                  { value: 'fraud', name: 'Fraud & Security' },
                                  { value: 'success', name: 'Customer Success' },
                                ].map(({ value, name }) => (
                                  <SelectItem key={value} value={value}>{name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground block mb-1.5">Priority</span>
                            <Select value={convoPriority} onValueChange={(v) => setConvoPriority(v as typeof convoPriority)}>
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  <span className="flex items-center gap-2">
                                    {convoPriority === 'normal' && <Minus className="size-4 text-muted-foreground" />}
                                    {convoPriority === 'high' && <BarChart2 className="size-4 text-amber-500" />}
                                    {convoPriority === 'critical' && <AlertTriangle className="size-4 text-destructive" />}
                                    {convoPriority === 'normal' ? 'Normal' : convoPriority === 'high' ? 'High' : 'Critical'}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal"><span className="flex items-center gap-2"><Minus className="size-4 text-muted-foreground" />Normal</span></SelectItem>
                                <SelectItem value="high"><span className="flex items-center gap-2"><BarChart2 className="size-4 text-amber-500" />High</span></SelectItem>
                                <SelectItem value="critical"><span className="flex items-center gap-2"><AlertTriangle className="size-4 text-destructive" />Critical</span></SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Conversation Labels */}
                          <div>
                            <span className="text-sm font-medium text-muted-foreground block mb-1.5">Conversation Labels</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <div className="relative">
                                <button
                                  onClick={() => { setShowLabelMenu(v => !v); setLabelSearch('') }}
                                  className="flex items-center gap-1 text-sm text-brand hover:underline"
                                >
                                  <Plus className="size-3.5" />Add Labels
                                </button>
                                {showLabelMenu && (
                                  <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg w-56 overflow-hidden">
                                    <div className="p-2 border-b border-border">
                                      <input
                                        ref={labelSearchRef}
                                        autoFocus
                                        value={labelSearch}
                                        onChange={e => setLabelSearch(e.target.value)}
                                        placeholder="Search labels..."
                                        className="w-full text-sm bg-muted rounded-lg px-2.5 py-1.5 outline-none text-foreground placeholder:text-muted-foreground"
                                        onKeyDown={e => {
                                          if (e.key === 'Enter' && labelSearch.trim() && !convoLabels.includes(labelSearch.trim())) {
                                            setConvoLabels(prev => [...prev, labelSearch.trim()])
                                            setLabelSearch('')
                                            setShowLabelMenu(false)
                                          }
                                        }}
                                      />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto py-1">
                                      {ALL_LABELS
                                        .filter(l => l.includes(labelSearch.toLowerCase()))
                                        .map(lbl => {
                                          const active = convoLabels.includes(lbl)
                                          return (
                                            <button
                                              key={lbl}
                                              onClick={() => setConvoLabels(prev => active ? prev.filter(l => l !== lbl) : [...prev, lbl])}
                                              className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                                            >
                                              <span className={cn('px-1.5 py-0.5 rounded border text-xs', TAG_COLORS[lbl] ?? 'bg-muted text-muted-foreground border-border')}>{lbl}</span>
                                              {active && <Check className="size-3 text-brand shrink-0" />}
                                            </button>
                                          )
                                        })
                                      }
                                      {ALL_LABELS.filter(l => l.includes(labelSearch.toLowerCase())).length === 0 && (
                                        <p className="px-3 py-2 text-sm text-muted-foreground">No labels found</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {convoLabels.map(lbl => (
                                <span key={lbl} className={cn('flex items-center gap-1 text-xs border rounded px-1.5 py-0.5', TAG_COLORS[lbl] ?? 'bg-muted text-muted-foreground border-border')}>
                                  {lbl}
                                  <button onClick={() => setConvoLabels(prev => prev.filter(l => l !== lbl))} className="hover:opacity-70"><X className="size-3" /></button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : selected ? (
              <CopilotPanel convo={selected} compact />
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

    </>
  )
}

export default function AllConversationsPage() {
  return <AllConversationsContent />
}
