import { useEffect, useState } from 'react'

type ProgressRow = { status: 'not_started' | 'in_progress' | 'done'; percent: number; updatedAt: string }
type Item = {
  id: string
  title: string
  author?: string | null
  year?: number | string | null
  source?: string
  url?: string
}

export default function Progress() {
  const [rows, setRows] = useState<Record<string, ProgressRow>>({})
  const [items, setItems] = useState<Record<string, Item>>({})
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())

  async function load() {
    const r = await fetch('/api/progress', { credentials: 'include' })
    const data = await r.json()
    setRows(data.progress || {})

    const r2 = await fetch('/api/saved', { credentials: 'include' })
    const data2 = await r2.json()
    const map: Record<string, Item> = {}
    const saved = new Set<string>()
    for (const item of data2.items || []) {
      map[item.id] = item
      saved.add(item.id)
    }
    setItems(map)
    setSavedItems(saved)
  }

  async function update(id: string, partial: Partial<ProgressRow>) {
    const current = rows[id] || { status: 'in_progress', percent: 0, updatedAt: new Date().toISOString() }
    const nextPercent = partial.percent !== undefined ? partial.percent : current.percent
    const nextStatus =
      partial.status === 'done'
        ? 'done'
        : nextPercent >= 100
        ? 'done'
        : partial.status || current.status
  
    const next: ProgressRow = {
      ...current,
      ...partial,
      percent: nextPercent,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    }
  
    await fetch(`/api/progress/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(next),
    })
    load()
  
  }

  async function saveItem(item: Item) {
    try {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item),
      })
      setSavedItems(prev => new Set(prev).add(item.id))
    } catch (err) {
      console.error(err)
    }
  }

  async function unsaveItem(id: string) {
    try {
      await fetch(`/api/saved/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      setSavedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { load() }, [])

  // Group items by source
  const grouped: Record<string, [Item, ProgressRow][]> = {}
  for (const [id, item] of Object.entries(items)) {
    const row = rows[id] || { status: 'not_started', percent: 0, updatedAt: new Date().toISOString() }
    const group = item.source || 'other'
    if (!grouped[group]) grouped[group] = []
    grouped[group].push([item, row])
  }

  const sourceLabels: Record<string, string> = {
    youtube: '📹 Videos',
    other: 'Other',
  }

  return (
    <div>
      <h2>Saved</h2>
      {Object.entries(grouped).map(([source, list]) => (
        <div key={source} style={{ marginBottom: 32 }}>
          <h3>{sourceLabels[source] || source}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {list.map(([item, row]) => {
              const status = row.status
              const percent = row.percent
              const isSaved = savedItems.has(item.id)

              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor:
                      item.source === 'youtube'
                        ? status === 'done'
                          ? '#e6f4ea'
                          : status === 'in_progress'
                          ? '#f1f3f4'
                          : 'white'
                        : 'white',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
                      {item.author || 'Unknown'} {item.year ? `(${item.year})` : ''}
                    </div>

                    {/* Progress bar */}
                    <div style={{ background: '#e9ecef', borderRadius: 4, overflow: 'hidden', height: 10, marginBottom: 6 }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          background: status === 'done' ? '#28a745' : '#007bff',
                          height: '100%',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 8 }}>
                      {status} • {percent}% • Updated {new Date(row.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Buttons + Save/Unsave + Watch */}
                  <div
                    style={{
                      marginTop: 'auto',
                      backgroundColor: '#f8f9fa',
                      padding: 8,
                      borderRadius: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 0,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      
                      <button
                        onClick={() => update(item.id, { percent: Math.min(100, percent + 25) })}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: 3,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        +25%
                      </button>
                      <button
                        onClick={() => {
                          if (status === 'done') {
                            update(item.id, { status: 'in_progress', percent: 0 }) // reset progress to 0
                          } else {
                            update(item.id, { status: 'done', percent: 100 }) // mark as complete
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: status === 'done' ? '#ffc107' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: 3,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {status === 'done' ? 'Reset' : 'Complete'}
                      </button>

                      {/* Save / Unsave */}
                      <button
                        onClick={() => (isSaved ? unsaveItem(item.id) : saveItem(item))}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: isSaved ? '#dc3545' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: 3,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {isSaved ? 'Unsave' : 'Save'}
                      </button>

                      {/* Watch button */}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: 3,
                            fontSize: 12,
                          }}
                        >
                          Watch
                        </a>
                      )}
                    </div>

                    {/* Status icon */}
                    {status !== 'not_started' && (
                      <span style={{ fontSize: 20 }}>
                        {status === 'in_progress' && <span title="In Progress" style={{ color: '#6c757d' }}>⏳</span>}
                        {status === 'done' && <span title="Completed" style={{ color: '#28a745' }}>✅</span>}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
