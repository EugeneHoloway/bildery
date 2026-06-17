'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/DashboardHeader'
import {
  SidebarInset,
  SidebarProvider,
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
  Mic, Zap, Maximize2, Twitter, Linkedin, Phone, Building2, MapPin,
  Pencil, PhoneCall, Trash2, X, User, BadgeCheck, Crown,
  Minus, Wrench, BarChart2, Tag, Plus, AlertTriangle, SlidersHorizontal,
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
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Klaus Crawley',
    channel: 'website',
    channelLabel: 'Website',
    preview: '@Ben Nugent Can we use Captain here to automate these queries?',
    time: '1d · 34m',
    priority: 'normal',
    tags: ['device-setup'],
    isNote: true,
    verified: true,
    assigned: true,
    assignee: 'David Wallace',
  },
  {
    id: '2',
    name: 'Coreen Mewett',
    channel: 'facebook',
    channelLabel: 'Facebook',
    preview: "I'm sorry to hear that. Please chang...",
    time: '1d · 37m',
    unread: 2,
    assigned: true,
    assignee: 'David Wallace',
  },
  {
    id: '3',
    name: 'Quent Dalliston',
    channel: 'whatsapp',
    channelLabel: 'Whatsapp',
    preview: 'Sure! Can you please provide me wi...',
    time: '1d · 37m',
    verified: true,
    vip: true,
    assigned: false,
  },
  {
    id: '4',
    name: 'Nathaniel Vannuchi',
    channel: 'facebook',
    channelLabel: 'Facebook',
    preview: 'Hey there, I need some help with billing...',
    time: '1d · 37m',
    priority: 'normal',
    vip: true,
    assigned: true,
    assignee: 'David Wallace',
  },
  {
    id: '5',
    name: 'Claus Jira',
    channel: 'whatsapp',
    channelLabel: 'Whatsapp',
    preview: "I'm sorry to hear that. Can you plea...",
    time: '1d · 37m',
    assigned: false,
  },
  {
    id: '6',
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
  },
  {
    id: '8',
    name: 'Tom Harrigan',
    channel: 'api',
    channelLabel: 'API',
    preview: 'Can you help me set up the integration?',
    time: '2d · 12m',
    assigned: false,
  },
  {
    id: '9',
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
  },
  {
    id: '10',
    name: 'Dmitri Volkov',
    channel: 'website',
    channelLabel: 'Website',
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
}

const CHANNEL_ICON_MAP: Record<Channel, React.ElementType> = {
  website: Globe,
  facebook: Facebook,
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
}

const MINE_IDS = new Set(['1', '2', '4', '6', '7', '9'])
const UNASSIGNED_IDS = new Set(['3', '5', '8', '10'])

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
        {/* Avatar placeholder */}
        <div className="size-9 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0 text-sm font-medium text-muted-foreground">
          {convo.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Channel row */}
          <div className="flex items-center gap-2 mb-0.5 overflow-hidden">
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              {(() => { const Icon = CHANNEL_ICON_MAP[convo.channel]; return <Icon className="size-3 shrink-0" /> })()}
              {convo.channelLabel}
            </span>
            <div className="flex items-center gap-1 ml-auto shrink-0">
              {convo.assignee && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground max-w-[90px] truncate">
                  <User className="size-3 shrink-0" />
                  <span className="truncate">{convo.assignee}</span>
                </span>
              )}
              {convo.priority && <PriorityBadge priority={convo.priority} />}
            </div>
          </div>
          {/* Name + time row */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 min-w-0">
              <span className={cn('text-sm text-foreground truncate', convo.unread && 'font-medium')}>{convo.name}</span>
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
              <span className="ml-auto shrink-0 size-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-medium">
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
  const [status, setStatus] = useState<'open' | 'on_hold' | 'resolved'>('open')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Contact Attributes']))
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
    return c.name.toLowerCase().includes(search.toLowerCase())
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
                    <div className="flex justify-center py-2 border-b border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
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
                                ? 'bg-brand text-white'
                                : 'bg-muted-foreground/20 text-muted-foreground'
                            )}>
                              {convo.name.charAt(0)}
                            </div>
                            {convo.unread && convo.unread > 0 ? (
                              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-brand text-white text-[10px] font-medium flex items-center justify-center px-0.5">
                                {convo.unread}
                              </span>
                            ) : null}
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
                    <div className="px-4 pt-4 pb-2">
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
              <div className="flex items-center px-4 py-3 border-b border-border shrink-0">
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
                    <div className="flex items-center gap-1">
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
                      {status === 'open' ? 'Open' : status === 'on_hold' ? 'On hold' : 'Resolved'}
                      <ChevronDown className="size-3" />
                    </Button>
                    {showStatusMenu && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-md overflow-hidden min-w-[120px]">
                        {([
                          { key: 'open', label: 'Open' },
                          { key: 'on_hold', label: 'On hold' },
                          { key: 'resolved', label: 'Resolved' },
                        ] as const).map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => { setStatus(key); setShowStatusMenu(false) }}
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
                <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 flex flex-col gap-4">
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
                        {[Smile, Paperclip, Mic, Zap].map((Icon, i) => (
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
                      <div className="size-14 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xl font-semibold text-muted-foreground mb-3">
                        {selected.name.charAt(0)}
                      </div>
                      <div className="relative flex items-center justify-center">
                        <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                        {(selected.verified || selected.vip) && (
                          <div className="absolute left-full ml-1 flex items-center gap-0.5">
                            {selected.verified && <BadgeCheck className="size-3.5 text-brand" />}
                            {selected.vip && <Crown className="size-3.5 text-amber-500" />}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Gold customer</p>

                      {/* Contact details */}
                      <div className="w-full mt-3 flex flex-col gap-1.5">
                        {[
                          { icon: User, text: 'USR-48291673' },
                          { icon: Mail, text: 'kcrawley6@driftburner.inc' },
                          { icon: Phone, text: '+14155552398' },
                          { icon: MapPin, text: 'San Francisco, United States' },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} className="flex items-center gap-2">
                            <Icon className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{text}</span>
                            <Copy className="size-3 text-muted-foreground ml-auto shrink-0 cursor-pointer hover:text-foreground" />
                          </div>
                        ))}
                      </div>

                      {/* Social */}
                      <div className="flex gap-2 mt-3">
                        {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                          <button key={i} className="size-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground">
                            <Icon className="size-3.5" />
                          </button>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        {[
                          { icon: MessageSquare, label: 'Message' },
                          { icon: Pencil, label: 'Edit' },
                          { icon: PhoneCall, label: 'Call' },
                          { icon: Trash2, label: 'Delete', destructive: true },
                        ].map(({ icon: Icon, label, destructive }) => (
                          <button
                            key={label}
                            title={label}
                            className={cn(
                              'size-8 rounded-full flex items-center justify-center',
                              destructive
                                ? 'bg-destructive-bg text-destructive hover:bg-destructive/20'
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
                      'Conversation Information',
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
                                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success-bg text-success"><ShieldCheck className="size-3" />Active</span>
                              </div>

                              {/* Balances */}
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Balances</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleDollarSign className="size-3.5" />Real money</span>
                                  <span className="text-xs text-foreground">$1,240.00</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gift className="size-3.5" />Bonus</span>
                                  <span className="text-xs text-foreground">$180.00</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />Pending withdrawal</span>
                                  <span className="text-xs text-foreground">$500.00</span>
                                </div>
                                <div className="pt-2 border-t border-border flex items-center justify-around">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-sm font-medium text-foreground">$24,300</span>
                                    <span className="text-[10px] text-muted-foreground">Deposits</span>
                                    <span className="text-[10px] text-muted-foreground">47 times</span>
                                  </div>
                                  <div className="w-px h-10 bg-border" />
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-sm font-medium text-foreground">$19,750</span>
                                    <span className="text-[10px] text-muted-foreground">Withdrawals</span>
                                    <span className="text-[10px] text-muted-foreground">31 times</span>
                                  </div>
                                </div>
                              </div>

                              {/* Last transaction */}
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Last Transaction</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CreditCard className="size-3.5" />Deposit · Visa</span>
                                  <span className="text-xs text-foreground">+$500</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Jan 14, 2026</span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-success-bg text-success">Completed</span>
                                </div>
                              </div>

                              {/* Active bonus */}
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Active Bonus</p>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Flame className="size-3.5 text-amber-500" />100% Deposit Bonus</span>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Wagered</span>
                                  <span className="text-xs text-foreground">$340 / $500</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-muted-foreground/20">
                                  <div className="h-1.5 rounded-full bg-amber-500" style={{width: '68%'}} />
                                </div>
                                <span className="text-[10px] text-muted-foreground">Expires Jan 20, 2026</span>
                              </div>

                              {/* KYC & Account */}
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">KYC & Account</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />Verification</span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-success-bg text-success">Verified</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="size-3.5" />VIP Level</span>
                                  <span className="text-xs text-foreground">Gold</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />Registered</span>
                                  <span className="text-xs text-foreground">Mar 5, 2023</span>
                                </div>
                              </div>

                              {/* Last activity */}
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Last Activity</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><LogIn className="size-3.5" />Last login</span>
                                  <span className="text-xs text-foreground">Today, 11:42 AM</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gamepad2 className="size-3.5" />Last game</span>
                                  <span className="text-xs text-foreground">Book of Dead</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" />Location</span>
                                  <span className="text-xs text-foreground">DE · Berlin</span>
                                </div>
                              </div>

                              {/* Limits */}
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Limits & Restrictions</p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleDollarSign className="size-3.5" />Daily deposit</span>
                                  <span className="text-xs text-foreground">$500 / day</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Timer className="size-3.5" />Session limit</span>
                                  <span className="text-xs text-foreground">3h / session</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleAlert className="size-3.5" />Self-exclusion</span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">None</span>
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
                                      <p className="text-[10px] text-muted-foreground">{role}</p>
                                    </div>
                                    {role !== 'Assignee' && (
                                      <button className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">
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
                                    <p key={action} className="text-[10px] text-muted-foreground flex items-start gap-1">
                                      <span className="mt-0.5 shrink-0">·</span>{action}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {isExpanded && section === 'Conversation Information' && (
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
                              {PREV_CONVERSATIONS.map((prev) => {
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
                                          'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
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
                                  <button className="flex items-center gap-1 text-xs text-brand hover:underline">
                                    <Plus className="size-3" />Add Labels
                                  </button>
                                  <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 rounded px-1.5 py-0.5">
                                    login-issue
                                    <button className="hover:text-foreground"><X className="size-3" /></button>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                        <Zap className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Copilot</p>
                      <p className="text-xs text-muted-foreground">AI assistant will be available here.</p>
                    </div>
                  </div>
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
                  <div className="size-14 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xl font-semibold text-muted-foreground mb-3">
                    {selected.name.charAt(0)}
                  </div>
                  <div className="relative flex items-center justify-center">
                    <p className="text-base font-semibold text-foreground">{selected.name}</p>
                    {(selected.verified || selected.vip) && (
                      <div className="absolute left-full ml-1 flex items-center gap-0.5">
                        {selected.verified && <BadgeCheck className="size-4 text-brand" />}
                        {selected.vip && <Crown className="size-4 text-amber-500" />}
                      </div>
                    )}
                  </div>
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
                  <div className="flex gap-2 mt-3">
                    {[
                      { icon: MessageSquare, label: 'Message' },
                      { icon: Pencil, label: 'Edit' },
                      { icon: PhoneCall, label: 'Call' },
                      { icon: Trash2, label: 'Delete', destructive: true },
                    ].map(({ icon: Icon, label, destructive }) => (
                      <button
                        key={label}
                        title={label}
                        className={cn(
                          'size-9 rounded-full flex items-center justify-center',
                          destructive
                            ? 'bg-destructive-bg text-destructive hover:bg-destructive/20'
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
                  'Conversation Information',
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
                            <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-success-bg text-success"><ShieldCheck className="size-3" />Active</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Balances</p>
                            {[
                              { icon: CircleDollarSign, label: 'Real money', value: '$1,240.00' },
                              { icon: Gift, label: 'Bonus', value: '$180.00' },
                              { icon: Clock, label: 'Pending withdrawal', value: '$500.00' },
                            ].map(({ icon: Icon, label, value }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="size-4" />{label}</span>
                                <span className="text-sm text-foreground">{value}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-border flex items-center justify-around">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-base font-medium text-foreground">$24,300</span>
                                <span className="text-xs text-muted-foreground">Deposits</span>
                                <span className="text-xs text-muted-foreground">47 times</span>
                              </div>
                              <div className="w-px h-10 bg-border" />
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-base font-medium text-foreground">$19,750</span>
                                <span className="text-xs text-muted-foreground">Withdrawals</span>
                                <span className="text-xs text-muted-foreground">31 times</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Last Transaction</p>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><CreditCard className="size-4" />Deposit · Visa</span>
                              <span className="text-sm text-foreground">+$500</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Jan 14, 2026</span>
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-success-bg text-success">Completed</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Active Bonus</p>
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Flame className="size-4 text-amber-500" />100% Deposit Bonus</span>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Wagered</span>
                              <span className="text-sm text-foreground">$340 / $500</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-muted-foreground/20">
                              <div className="h-1.5 rounded-full bg-amber-500" style={{width: '68%'}} />
                            </div>
                            <span className="text-xs text-muted-foreground">Expires Jan 20, 2026</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">KYC & Account</p>
                            {[
                              { icon: ShieldCheck, label: 'Verification', badge: 'Verified', badgeClass: 'bg-success-bg text-success' },
                              { icon: TrendingUp, label: 'VIP Level', value: 'Gold' },
                              { icon: Clock, label: 'Registered', value: 'Mar 5, 2023' },
                            ].map(({ icon: Icon, label, badge, badgeClass, value }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="size-4" />{label}</span>
                                {badge
                                  ? <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', badgeClass)}>{badge}</span>
                                  : <span className="text-sm text-foreground">{value}</span>}
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Last Activity</p>
                            {[
                              { icon: LogIn, label: 'Last login', value: 'Today, 11:42 AM' },
                              { icon: Gamepad2, label: 'Last game', value: 'Book of Dead' },
                              { icon: MapPin, label: 'Location', value: 'DE · Berlin' },
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
                              <span className="text-sm text-foreground">$500 / day</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Timer className="size-4" />Session limit</span>
                              <span className="text-sm text-foreground">3h / session</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><CircleAlert className="size-4" />Self-exclusion</span>
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">None</span>
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
                      {isExpanded && section === 'Conversation Information' && (
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
                          {PREV_CONVERSATIONS.map((prev) => {
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
                                      'text-xs font-medium px-1.5 py-0.5 rounded-full',
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
                                  <SelectItem key={value} value={value}>
                                    <span className="flex items-center gap-2">
                                      <div className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">{name.charAt(0)}</div>
                                      {name}
                                    </span>
                                  </SelectItem>
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
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <Zap className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Copilot</p>
                  <p className="text-xs text-muted-foreground">AI assistant will be available here.</p>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

    </>
  )
}

export default function AllConversationsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AllConversationsContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
