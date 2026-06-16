'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/DashboardHeader'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, MessageSquare, Globe, Facebook, Mail, Settings, Lock,
  BellOff, Share2, ChevronDown, ChevronRight, Copy, Bold, Italic,
  Link2, Undo2, Redo2, List, ListOrdered, Code2, Smile, Paperclip,
  Mic, Zap, Maximize2, Twitter, Linkedin, Phone, Building2, MapPin,
  Pencil, PhoneCall, Trash2, X, User, BadgeCheck, Crown,
  Minus, Wrench, BarChart2, Tag, Plus,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
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
  },
  {
    id: '2',
    name: 'Coreen Mewett',
    channel: 'facebook',
    channelLabel: 'Facebook',
    preview: "I'm sorry to hear that. Please chang...",
    time: '1d · 37m',
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
  },
  {
    id: '5',
    name: 'Claus Jira',
    channel: 'whatsapp',
    channelLabel: 'Whatsapp',
    preview: "I'm sorry to hear that. Can you plea...",
    time: '1d · 37m',
  },
  {
    id: '6',
    name: 'Merrile Petruk',
    channel: 'email',
    channelLabel: 'Email',
    preview: "I'm sorry to hear that. Can you plea...",
    time: '1d · 37m',
    priority: 'urgent',
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
    unread: 1,
  },
  {
    id: '8',
    name: 'Tom Harrigan',
    channel: 'api',
    channelLabel: 'API',
    preview: 'Can you help me set up the integration?',
    time: '2d · 12m',
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

const TABS: { key: Tab; label: string; count: number }[] = [
  { key: 'mine', label: 'Mine', count: 11 },
  { key: 'unassigned', label: 'Unassigned', count: 5 },
  { key: 'all', label: 'All', count: 18 },
]

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === 'urgent') return <span className="text-destructive text-xs font-bold">!!!</span>
  if (priority === 'high') return <span className="text-orange-400 text-xs font-bold">!</span>
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
        <div className="flex-1 min-w-0 pr-2">
          {/* Channel row */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
              {(() => { const Icon = CHANNEL_ICON_MAP[convo.channel]; return <Icon className="size-3 shrink-0" /> })()}
              {convo.channelLabel}
            </span>
            {convo.priority && <PriorityBadge priority={convo.priority} />}
          </div>
          {/* Name + time row */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">{convo.name}</span>
              {convo.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand" />}
              {convo.vip && <Crown className="size-3.5 shrink-0 text-amber-500" />}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">{convo.time}</span>
          </div>
          {/* Preview */}
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            {convo.isNote && <Lock className="size-3 shrink-0 text-muted-foreground" />}
            <p className="text-xs text-muted-foreground truncate min-w-0 flex-1">{convo.preview}</p>
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

export default function AllConversationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('mine')
  const [search, setSearch] = useState('')
  const [contactTab, setContactTab] = useState<'contact' | 'copilot'>('contact')
  const [showSidebar, setShowSidebar] = useState(true)
  const [status, setStatus] = useState<'open' | 'on_hold' | 'resolved'>('open')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Conversation Actions']))
  const toggleSection = (section: string) => setExpandedSections(prev => {
    const next = new Set(prev)
    next.has(section) ? next.delete(section) : next.add(section)
    return next
  })

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null

  const filtered = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const selected = CONVERSATIONS.find((c) => c.id === selectedId)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader
          breadcrumbs={[
            { label: 'Bildery', href: '/dashboard' },
            { label: 'Conversations' },
            { label: 'All Conversations' },
          ]}
        />
        <div className="flex h-[calc(100vh-57px)] overflow-hidden">
          {/* Conversations panel */}
          <div className="w-80 shrink-0 flex flex-col border-r border-border">
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold text-foreground">Conversations</h2>
                <Badge className="text-xs">Open</Badge>
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

          {/* Main area */}
          {selected ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Full-width header */}
              <div className="flex items-center px-4 py-3 border-b border-border shrink-0">
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
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="text-xs text-brand hover:underline"
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

                {/* Sidebar toggle button */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="absolute right-0 top-24 -translate-y-1/2 translate-x-1/2 z-10 size-6 rounded-full bg-foreground border border-border flex items-center justify-center shadow-sm hover:bg-foreground/80 transition-colors"
                >
                  {showSidebar
                    ? <ChevronRight className="size-3 text-background" />
                    : <ChevronRight className="size-3 text-background rotate-180" />
                  }
                </button>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 flex flex-col gap-4">
                  {/* Incoming 1 */}
                  <div className="flex gap-3 max-w-[70%]">
                    <div className="size-7 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0 mt-1">{selected.name.charAt(0)}</div>
                    <div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <p className="text-sm text-foreground">Hi, I need some help setting up my new device.</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-1">Jan 15, 12:32 PM</p>
                    </div>
                  </div>

                  {/* Outgoing 1 */}
                  <div className="flex gap-3 max-w-[70%] self-end flex-row-reverse">
                    <div className="size-7 rounded-full bg-brand/20 flex items-center justify-center text-xs font-medium text-brand shrink-0 mt-1">M</div>
                    <div>
                      <div className="bg-brand text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                        <p className="text-sm">No problem! Can you please tell me the make and model of your device and what specifically you need help with?</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mr-1 text-right">Jan 15, 12:32 PM</p>
                    </div>
                  </div>

                  {/* Incoming 2 */}
                  <div className="flex gap-3 max-w-[70%]">
                    <div className="size-7 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0 mt-1">{selected.name.charAt(0)}</div>
                    <div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <p className="text-sm text-foreground">It&apos;s a MacBook Pro M3, 14-inch. I can&apos;t get the external display to work properly — it keeps flickering.</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-1">Jan 15, 12:35 PM</p>
                    </div>
                  </div>

                  {/* Outgoing 2 */}
                  <div className="flex gap-3 max-w-[70%] self-end flex-row-reverse">
                    <div className="size-7 rounded-full bg-brand/20 flex items-center justify-center text-xs font-medium text-brand shrink-0 mt-1">M</div>
                    <div>
                      <div className="bg-brand text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                        <p className="text-sm">Got it! First, try updating macOS to the latest version. Also, what cable or adapter are you using to connect the display?</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mr-1 text-right">Jan 15, 12:37 PM</p>
                    </div>
                  </div>

                  {/* Incoming 3 */}
                  <div className="flex gap-3 max-w-[70%]">
                    <div className="size-7 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0 mt-1">{selected.name.charAt(0)}</div>
                    <div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <p className="text-sm text-foreground">I&apos;m using a USB-C to HDMI cable. macOS is already up to date.</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-1">Jan 15, 12:40 PM</p>
                    </div>
                  </div>

                  {/* System events */}
                  <div className="flex flex-col items-center gap-1 py-2">
                    {[
                      'Assigned to support m2 by Mathew M',
                      'Mathew M self-assigned this conversation',
                      'Mathew M set the priority to high',
                      'Mathew M added device-setup',
                    ].map((event) => (
                      <p key={event} className="text-xs text-muted-foreground">{event}</p>
                    ))}
                  </div>

                  {/* Private note */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3 max-w-[80%] self-end">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold text-brand">@Ben Nugent</span> Can we use Captain here to automate these queries?
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p className="text-xs text-muted-foreground">Jan 16, 2:16 PM</p>
                      <Lock className="size-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Reply input */}
                <div className="shrink-0 border-t border-border">
                  <div className="flex border-b border-border">
                    <button className="px-4 py-2.5 text-sm font-medium text-foreground border-b-2 border-foreground">Reply</button>
                    <button className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">Private Note</button>
                    <button className="ml-auto px-3 py-2"><Maximize2 className="size-4 text-muted-foreground" /></button>
                  </div>
                  <div className="flex gap-1 px-3 py-2 border-b border-border">
                    {[Bold, Italic, Link2, Undo2, Redo2, List, ListOrdered, Code2].map((Icon, i) => (
                      <button key={i} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Icon className="size-3.5" />
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-3 min-h-[80px]">
                    <p className="text-sm text-muted-foreground">Shift + enter for new line. Start with &apos;/&apos; to select a Canned Response.</p>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                    <div className="flex gap-1">
                      {[Smile, Paperclip, Mic, Zap].map((Icon, i) => (
                        <button key={i} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                          <Icon className="size-4" />
                        </button>
                      ))}
                    </div>
                    <Button size="sm" className="h-8">Send <span className="ml-1 opacity-60 text-xs">↵</span></Button>
                  </div>
                </div>
              </div>

              {/* Contact sidebar */}
              {showSidebar && <div className="w-72 shrink-0 flex flex-col overflow-y-auto">
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
                      <p className="text-xs text-muted-foreground mt-0.5">Founder, Drift Burner</p>

                      {/* Contact details */}
                      <div className="w-full mt-3 flex flex-col gap-1.5">
                        {[
                          { icon: Mail, text: 'kcrawley6@driftburner.inc' },
                          { icon: Phone, text: '+14155552398' },
                          { icon: Building2, text: 'Drift Burner' },
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
                      'Conversation Actions',
                      'Conversation participants',
                      'Macros',
                      'Contact Attributes',
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
                          {isExpanded && section === 'Conversation Actions' && (
                            <div className="px-4 pb-4 flex flex-col gap-3">
                              {/* Assigned Agent */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-medium text-muted-foreground">Assigned Agent</span>
                                  <button className="text-xs text-brand hover:underline flex items-center gap-0.5">
                                    <ChevronRight className="size-3 rotate-180" />Assign to me
                                  </button>
                                </div>
                                <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground">D</div>
                                    <span className="text-sm text-foreground">David Wallace</span>
                                  </div>
                                  <ChevronDown className="size-4 text-muted-foreground" />
                                </div>
                              </div>
                              {/* Assigned Team */}
                              <div>
                                <span className="text-xs font-medium text-muted-foreground block mb-1.5">Assigned Team</span>
                                <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="size-5 rounded-full bg-success-bg flex items-center justify-center">
                                      <Wrench className="size-3 text-success" />
                                    </div>
                                    <span className="text-sm text-foreground">technical support</span>
                                  </div>
                                  <ChevronDown className="size-4 text-muted-foreground" />
                                </div>
                              </div>
                              {/* Priority */}
                              <div>
                                <span className="text-xs font-medium text-muted-foreground block mb-1.5">Priority</span>
                                <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <BarChart2 className="size-4 text-amber-500" />
                                    <span className="text-sm text-foreground">High</span>
                                  </div>
                                  <ChevronDown className="size-4 text-muted-foreground" />
                                </div>
                              </div>
                              {/* Conversation Labels */}
                              <div>
                                <span className="text-xs font-medium text-muted-foreground block mb-1.5">Conversation Labels</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button className="flex items-center gap-1 text-xs text-brand hover:underline">
                                    <Plus className="size-3" />Add Labels
                                  </button>
                                  <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 rounded px-1.5 py-0.5">
                                    <Tag className="size-3" />login-issue
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
      </SidebarInset>
    </SidebarProvider>
  )
}
