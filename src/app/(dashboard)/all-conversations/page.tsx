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
  Pencil, PhoneCall, Trash2, X,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Klaus Crawley',
    channel: 'website',
    channelLabel: 'PaperLayer Website',
    preview: '@Ben Nugent Can we use Captain here to automate these queries?',
    time: '1d · 34m',
    priority: 'normal',
    tags: ['device-setup'],
    isNote: true,
  },
  {
    id: '2',
    name: 'Coreen Mewett',
    channel: 'facebook',
    channelLabel: 'PaperLayer Facebook',
    preview: "I'm sorry to hear that. Please chang...",
    time: '1d · 37m',
  },
  {
    id: '3',
    name: 'Quent Dalliston',
    channel: 'whatsapp',
    channelLabel: 'PaperLayer Whatsapp',
    preview: 'Sure! Can you please provide me wi...',
    time: '1d · 37m',
  },
  {
    id: '4',
    name: 'Nathaniel Vannuchi',
    channel: 'facebook',
    channelLabel: 'PaperLayer Facebook',
    preview: 'Hey there, I need some help with billing...',
    time: '1d · 37m',
    priority: 'normal',
  },
  {
    id: '5',
    name: 'Claus Jira',
    channel: 'whatsapp',
    channelLabel: 'PaperLayer Whatsapp',
    preview: "I'm sorry to hear that. Can you plea...",
    time: '1d · 37m',
  },
  {
    id: '6',
    name: 'Merrile Petruk',
    channel: 'email',
    channelLabel: 'PaperLayer Email',
    preview: "I'm sorry to hear that. Can you plea...",
    time: '1d · 37m',
    priority: 'urgent',
  },
  {
    id: '7',
    name: 'Candice Matherson',
    channel: 'email',
    channelLabel: 'PaperLayer Email',
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
    channelLabel: 'PaperLayer API',
    preview: 'Can you help me set up the integration?',
    time: '2d · 12m',
  },
  {
    id: '9',
    name: 'Sandra Mills',
    channel: 'email',
    channelLabel: 'PaperLayer Email',
    preview: 'My subscription was charged twice...',
    time: '2d · 45m',
    priority: 'high',
    tags: ['billing'],
  },
  {
    id: '10',
    name: 'Dmitri Volkov',
    channel: 'website',
    channelLabel: 'PaperLayer Website',
    preview: 'Looking for enterprise pricing options',
    time: '3d · 2h',
    tags: ['lead'],
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
            <span className="text-sm font-medium text-foreground truncate">{convo.name}</span>
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground">Conversations</h2>
                <Badge variant="outline" className="text-xs">Open</Badge>
              </div>
              {/* Tabs */}
              <div className="flex items-center gap-1 mb-3">
                {TABS.map((tab) => (
                  <Toggle
                    key={tab.key}
                    size="sm"
                    pressed={activeTab === tab.key}
                    onPressedChange={() => setActiveTab(tab.key)}
                    className="gap-1.5 border border-border bg-background hover:bg-muted data-[state=on]:bg-muted data-[state=on]:border-border"
                  >
                    {tab.label}
                    <span className="text-xs opacity-70">{tab.count}</span>
                  </Toggle>
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
            <>
              {/* Chat column */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-border">
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{selected.name}</p>
                      <div className="flex items-center gap-1">
                        {(() => { const Icon = CHANNEL_ICON_MAP[selected.channel]; return <Icon className="size-3 text-muted-foreground" /> })()}
                        <span className="text-xs text-brand cursor-pointer hover:underline">{selected.channelLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-8"><BellOff className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8"><Share2 className="size-4" /></Button>
                    <Button variant="default" size="sm" className="h-8 gap-1">
                      Resolve <ChevronDown className="size-3" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                  {/* Incoming message */}
                  <div className="flex gap-3 max-w-[70%]">
                    <div className="size-7 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0 mt-1">
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <p className="text-sm text-foreground">Hi, I need some help setting up my new device.</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-1">Jan 15, 12:32 PM</p>
                    </div>
                  </div>

                  {/* Outgoing message */}
                  <div className="flex gap-3 max-w-[70%] self-end flex-row-reverse">
                    <div className="size-7 rounded-full bg-brand/20 flex items-center justify-center text-xs font-medium text-brand shrink-0 mt-1">
                      M
                    </div>
                    <div>
                      <div className="bg-brand text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                        <p className="text-sm">No problem! Can you please tell me the make and model of your device and what specifically you need help with?</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mr-1 text-right">Jan 15, 12:32 PM</p>
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
              <div className="w-72 shrink-0 flex flex-col overflow-y-auto">
                <Tabs defaultValue="contact" className="flex-1 flex flex-col">
                  <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0">
                    <TabsTrigger value="contact" className="flex-1 rounded-none border-b-2 data-[state=active]:border-foreground data-[state=inactive]:border-transparent py-3 text-sm">Contact</TabsTrigger>
                    <TabsTrigger value="copilot" className="flex-1 rounded-none border-b-2 data-[state=active]:border-foreground data-[state=inactive]:border-transparent py-3 text-sm">Copilot</TabsTrigger>
                  </TabsList>

                  <TabsContent value="contact" className="flex-1 flex flex-col p-0 mt-0">
                    {/* Avatar + name */}
                    <div className="flex flex-col items-center pt-6 pb-4 px-4 border-b border-border">
                      <div className="size-14 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xl font-semibold text-muted-foreground mb-3">
                        {selected.name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-foreground">{selected.name}</p>
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
                    ].map((section) => (
                      <div key={section} className="flex items-center justify-between px-4 py-3 border-b border-border cursor-pointer hover:bg-muted/50">
                        <span className="text-sm font-medium text-foreground">{section}</span>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="copilot" className="flex-1 flex items-center justify-center p-8 mt-0">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                        <Zap className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Copilot</p>
                      <p className="text-xs text-muted-foreground">AI assistant will be available here.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
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
