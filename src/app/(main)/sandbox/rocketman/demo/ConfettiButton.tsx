'use client'

import { useRef, type ReactNode } from 'react'

// ── Single token: set to false to disable the effect globally ─────────────────
export const CONFETTI_ENABLED = true

// ── Project chart colors ──────────────────────────────────────────────────────
// Resolved at runtime from CSS custom properties so dark-mode works too
const COLOR_VARS = [
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
]

function resolveColor(v: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888'
}

// ── Keyframes — injected once ─────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes rktm-burst {
  0%   { transform: translate(0px, 0px) scale(1);   opacity: 0.9; }
  70%  { opacity: 0.6; }
  100% { transform: translate(var(--rktm-dx), var(--rktm-dy)) scale(0.15); opacity: 0; }
}
`

let injected = false
function ensureKeyframes() {
  if (injected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = KEYFRAMES
  document.head.appendChild(el)
  injected = true
}

// ── Spawn confetti fixed-positioned at the button's viewport rect ─────────────
// Uses document.body portal so no parent overflow-hidden can clip bubbles
function spawnConfetti(btn: HTMLButtonElement) {
  ensureKeyframes()
  const rect = btn.getBoundingClientRect()
  const colors = COLOR_VARS.map(resolveColor)

  const wrap = document.createElement('div')
  wrap.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    overflow: visible;
    z-index: 9999;
  `

  const COUNT = 14
  for (let i = 0; i < COUNT; i++) {
    const size      = 5 + Math.random() * 7          // px
    const angle     = Math.random() * 360             // all directions
    const dist      = 28 + Math.random() * 38         // px
    const dx        = Math.cos((angle * Math.PI) / 180) * dist
    const dy        = Math.sin((angle * Math.PI) / 180) * dist
    const x         = 10 + Math.random() * 80         // % across button width
    const duration  = 460 + Math.random() * 280       // ms
    const color     = colors[Math.floor(Math.random() * colors.length)]

    const b = document.createElement('span')
    b.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: 50%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${color};
      --rktm-dx: ${dx.toFixed(1)}px;
      --rktm-dy: ${dy.toFixed(1)}px;
      animation: rktm-burst ${duration}ms ease-out forwards;
    `
    wrap.appendChild(b)
  }

  document.body.appendChild(wrap)
  setTimeout(() => document.body.removeChild(wrap), 850)
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ConfettiButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function ConfettiButton({ children, onClick, className }: ConfettiButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  function handleClick() {
    onClick?.()
    if (CONFETTI_ENABLED && btnRef.current) {
      spawnConfetti(btnRef.current)
    }
  }

  return (
    <button ref={btnRef} onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
