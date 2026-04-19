'use client'

import { useEffect, useRef, useState } from 'react'

// ── Config ────────────────────────────────────────────────────────────────────
const LABELED_NAMES = [
  'Delivery', 'Prioritization', 'Segmentation',
  'Supabase', 'Lifetime Value', 'A/B Test', 'Unit Economics',
]
const SMALL_COUNT = 45
const SPHERE_R = 187
const FOV = 360

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

interface Point3D { x: number; y: number; z: number }

// Fibonacci sphere — evenly distributes N points on a sphere surface
function fibSphere(n: number, radius: number): Point3D[] {
  const pts: Point3D[] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = phi * i
    const depth = 0.55 + Math.random() * 0.45
    pts.push({
      x: Math.cos(theta) * r * radius * depth,
      y: y * radius * depth,
      z: Math.sin(theta) * r * radius * depth,
    })
  }
  return pts
}

// ── Graph data ────────────────────────────────────────────────────────────────
interface GraphNode extends Point3D {
  id: number
  label: string | null
  r: number
}
interface GraphEdge { s: number; t: number }

function initGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []

  const labeledPos = fibSphere(LABELED_NAMES.length, SPHERE_R)
  LABELED_NAMES.forEach((label, i) => {
    nodes.push({ id: i, label, r: 4.5, ...labeledPos[i] })
  })

  const smallPos = fibSphere(SMALL_COUNT, SPHERE_R)
  for (let i = 0; i < SMALL_COUNT; i++) {
    nodes.push({
      id: LABELED_NAMES.length + i,
      label: null,
      r: 2 + Math.random() * 3,
      ...smallPos[i],
    })
  }

  const edges: GraphEdge[] = []
  const n = nodes.length

  nodes.slice(0, LABELED_NAMES.length).forEach(node => {
    const count = 3 + Math.floor(Math.random() * 3)
    const seen = new Set([node.id])
    while (seen.size - 1 < count) {
      const t = Math.floor(Math.random() * n)
      if (!seen.has(t)) { seen.add(t); edges.push({ s: node.id, t }) }
    }
  })

  for (let i = 0; i < 32; i++) {
    const s = Math.floor(Math.random() * n)
    const t = Math.floor(Math.random() * n)
    if (s !== t) edges.push({ s, t })
  }

  return { nodes, edges }
}

// ── 3D rotation ───────────────────────────────────────────────────────────────
function rotate(x: number, y: number, z: number, rx: number, ry: number) {
  const cosY = Math.cos(ry), sinY = Math.sin(ry)
  const x1 = x * cosY + z * sinY
  const z1 = -x * sinY + z * cosY
  const cosX = Math.cos(rx), sinX = Math.sin(rx)
  const y2 = y * cosX - z1 * sinX
  const z2 = y * sinX + z1 * cosX
  return { x: x1, y: y2, z: z2 }
}

function project(x: number, y: number, z: number, cx: number, cy: number) {
  const scale = FOV / (FOV + z)
  return { sx: x * scale + cx, sy: y * scale + cy, scale }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ForceGraph({ maxSize = 450 }: { maxSize?: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const graphRef   = useRef<ReturnType<typeof initGraph> | null>(null)
  const rafRef     = useRef<number>(0)
  const rotRef     = useRef({ x: 0.25, y: 0 })
  const velRef     = useRef({ x: 0, y: 0 })
  const dragRef    = useRef<{ lx: number; ly: number } | null>(null)
  const [size, setSize] = useState(maxSize)

  // Observe wrapper width → keep canvas square and responsive
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width)
      setSize(Math.min(w, maxSize))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [maxSize])

  const width  = size
  const height = size

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size === 0) return

    const dpr = window.devicePixelRatio || 1
    canvas.width  = width  * dpr
    canvas.height = height * dpr
    canvas.style.width  = width  + 'px'
    canvas.style.height = height + 'px'

    const ctx = canvas.getContext('2d')!
    graphRef.current = initGraph()

    const cx = width  / 2
    const cy = height / 2

    function frame() {
      const { nodes, edges } = graphRef.current!

      if (!dragRef.current) {
        rotRef.current.y += 0.00127 + velRef.current.y
        rotRef.current.x += 0.00023 + velRef.current.x
        velRef.current.x *= 0.94
        velRef.current.y *= 0.94
      }

      const rx = rotRef.current.x
      const ry = rotRef.current.y

      const proj = nodes.map(n => {
        const r3 = rotate(n.x, n.y, n.z, rx, ry)
        const { sx, sy, scale } = project(r3.x, r3.y, r3.z, cx, cy)
        const depth = (r3.z + SPHERE_R) / (2 * SPHERE_R)
        return { ...n, sx, sy, scale, depth, pz: r3.z }
      })

      const byId = new Map(proj.map(p => [p.id, p]))
      proj.sort((a, b) => a.pz - b.pz)

      ctx.clearRect(0, 0, width * dpr, height * dpr)
      ctx.save()
      ctx.scale(dpr, dpr)

      // Edges
      edges.forEach(({ s, t }) => {
        const a = byId.get(s)
        const b = byId.get(t)
        if (!a || !b) return
        const d = (a.depth + b.depth) / 2
        ctx.strokeStyle = `rgba(156,163,175,${(0.1 + d * 0.45).toFixed(2)})`
        ctx.lineWidth = 0.65
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.stroke()
      })

      // Pass 1 — nodes only
      proj.forEach(n => {
        const r  = Math.max(n.r * n.scale, 1)
        const op = (0.25 + n.depth * 0.75).toFixed(2)
        if (n.label) {
          ctx.beginPath()
          ctx.arc(n.sx, n.sy, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(17,24,39,${op})`
          ctx.fill()
        } else {
          const g = Math.round(80 + (1 - n.depth) * 140)
          ctx.beginPath()
          ctx.arc(n.sx, n.sy, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${g},${g},${g},${op})`
          ctx.fill()
        }
      })

      // Pass 2 — labels always on top
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      proj.filter(n => n.label).forEach(n => {
        const r  = Math.max(n.r * n.scale, 1)
        const fs = 11
        ctx.font = `${fs}px Inter,system-ui,sans-serif`
        const tw   = ctx.measureText(n.label!).width
        const padX = 6
        const bh   = Math.round(fs * 1.65)
        const bw   = tw + padX * 2
        let lx = n.sx + r + 4
        if (lx + bw > width - 6) lx = n.sx - r - 5 - bw
        const ly = n.sy - bh / 2

        ctx.fillStyle = 'rgba(17,24,39,0.92)'
        roundRect(ctx, lx, ly, bw, bh, 3)
        ctx.fill()

        ctx.fillStyle = 'rgba(249,250,251,0.92)'
        ctx.fillText(n.label!, lx + padX, n.sy)
      })

      ctx.restore()
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [size, width, height])

  // ── Mouse / touch ─────────────────────────────────────────────────────────
  function getXY(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onMouseDown(e: React.MouseEvent) {
    const { x, y } = getXY(e)
    dragRef.current = { lx: x, ly: y }
    velRef.current = { x: 0, y: 0 }
    canvasRef.current!.style.cursor = 'grabbing'
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return
    const { x, y } = getXY(e)
    const dx = x - dragRef.current.lx
    const dy = y - dragRef.current.ly
    rotRef.current.y += dx * 0.007
    rotRef.current.x += dy * 0.007
    velRef.current.y = dx * 0.007
    velRef.current.x = dy * 0.007
    dragRef.current = { lx: x, ly: y }
  }

  function onMouseUp() {
    dragRef.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }

  function onTouchStart(e: React.TouchEvent) {
    e.preventDefault()
    const t = e.touches[0]
    dragRef.current = { lx: t.clientX, ly: t.clientY }
    velRef.current = { x: 0, y: 0 }
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    if (!dragRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.lx
    const dy = t.clientY - dragRef.current.ly
    rotRef.current.y += dx * 0.007
    rotRef.current.x += dy * 0.007
    velRef.current.y = dx * 0.007
    velRef.current.x = dy * 0.007
    dragRef.current = { lx: t.clientX, ly: t.clientY }
  }

  return (
    <div ref={wrapperRef} style={{ width: '100%', maxWidth: maxSize + 'px' }}>
      <canvas
        ref={canvasRef}
        style={{ cursor: 'grab', display: 'block' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      />
    </div>
  )
}
