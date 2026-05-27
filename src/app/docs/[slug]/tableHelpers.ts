import type { Editor } from '@tiptap/core'

export function moveRow(editor: Editor, dir: 'up' | 'down') {
  editor.chain().focus().command(({ state, tr, dispatch }) => {
    const { $from } = state.selection

    let rowDepth = -1
    for (let d = $from.depth; d >= 0; d--) {
      if ($from.node(d).type.name === 'tableRow') { rowDepth = d; break }
    }
    if (rowDepth < 1) return false

    const tableNode  = $from.node(rowDepth - 1) as any
    const tableStart = $from.start(rowDepth - 1)
    const rowOffset  = $from.before(rowDepth) - tableStart

    let currentIdx = -1
    tableNode.forEach((_: any, offset: number, i: number) => {
      if (offset === rowOffset) currentIdx = i
    })
    if (currentIdx === -1) return false

    const targetIdx = dir === 'up' ? currentIdx - 1 : currentIdx + 1
    if (targetIdx < 0 || targetIdx >= tableNode.childCount) return false

    const rows: { node: any; start: number }[] = []
    tableNode.forEach((child: any, offset: number) => {
      rows.push({ node: child, start: tableStart + offset })
    })

    const a = rows[Math.min(currentIdx, targetIdx)]
    const b = rows[Math.max(currentIdx, targetIdx)]
    tr.replaceWith(a.start, b.start + b.node.nodeSize, [b.node, a.node])
    if (dispatch) dispatch(tr)
    return true
  }).run()
}

export function moveColumn(editor: Editor, dir: 'left' | 'right') {
  editor.chain().focus().command(({ state, tr, dispatch }) => {
    const { $from } = state.selection

    let cellDepth = -1
    for (let d = $from.depth; d >= 0; d--) {
      const name = $from.node(d).type.name
      if (name === 'tableCell' || name === 'tableHeader') { cellDepth = d; break }
    }
    if (cellDepth < 2) return false

    const rowDepth    = cellDepth - 1
    const tableDepth  = cellDepth - 2
    const rowNode     = $from.node(rowDepth) as any
    const tableNode   = $from.node(tableDepth) as any
    const tableStart  = $from.start(tableDepth)
    const cellOffset  = $from.before(cellDepth) - $from.start(rowDepth)

    let currentColIdx = -1
    rowNode.forEach((_: any, offset: number, i: number) => {
      if (offset === cellOffset) currentColIdx = i
    })
    if (currentColIdx === -1) return false

    const targetColIdx = dir === 'left' ? currentColIdx - 1 : currentColIdx + 1
    if (targetColIdx < 0 || targetColIdx >= rowNode.childCount) return false

    const tableRows: { node: any; start: number }[] = []
    tableNode.forEach((rowChild: any, rowOff: number) => {
      tableRows.push({ node: rowChild, start: tableStart + rowOff })
    })

    // Process rows in reverse so earlier positions aren't affected by later swaps
    for (let i = tableRows.length - 1; i >= 0; i--) {
      const { node: rn, start: rs } = tableRows[i]
      const cells: { node: any; start: number }[] = []
      rn.forEach((cell: any, offset: number) => {
        cells.push({ node: cell, start: rs + 1 + offset })
      })
      if (currentColIdx >= cells.length || targetColIdx >= cells.length) continue
      const a = cells[Math.min(currentColIdx, targetColIdx)]
      const b = cells[Math.max(currentColIdx, targetColIdx)]
      tr.replaceWith(a.start, b.start + b.node.nodeSize, [b.node, a.node])
    }

    if (dispatch) dispatch(tr)
    return true
  }).run()
}
