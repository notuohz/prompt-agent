'use client'

import { useState } from 'react'

const TARGET_AIS = [
  'Claude Code',
  'Claude',
  'ChatGPT',
  'Midjourney',
  'Cursor',
  'Other',
]

const LEVEL_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#06b6d4',
  6: '#8b5cf6',
  7: '#ec4899',
}

interface Result {
  generated_prompt: string
  current_level: number
  current_level_label: string
  current_level_summary: string
  next_level: number
  next_level_label: string
  next_level_actions: string[]
  techniques_applied: string[]
  refinement_suggestions: string[]
}

export default function Home() {
  const [goal, setGoal] = useState('')
  const [targetAI, setTargetAI] = useState('Claude Code')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [refining, setRefining] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [refineLoading, setRefineLoading] = useState(false)

  async function generate(customGoal?: string) {
    const input = customGoal ?? goal
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setRefining(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: input, targetAI }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function refine() {
    if (!refineInput.trim() || !result) return
    setRefineLoading(true)
    const refinedGoal = `${goal}\n\nAdditional context for refinement: ${refineInput}\n\nPlease improve the prompt taking this into account.`
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: refinedGoal, targetAI }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
      setRefineInput('')
      setRefining(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setRefineLoading(false)
    }
  }

  function copyPrompt() {
    if (!result) return
    navigator.clipboard.writeText(result.generated_prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const levelColor = result ? (LEVEL_COLORS[result.current_level] || '#6b7280') : '#6b7280'
  const nextColor = result ? (LEVEL_COLORS[result.next_level] || '#6b7280') : '#6b7280'

  return (
    <main className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 12, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Prompt Architect
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: '#e5e5e5', lineHeight: 1.2, marginBottom: 8 }}>
            Build elite websites.<br />Start with the right prompt.
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
            Describe what you want to build. Get a detailed, level-aware prompt ready to paste into your AI tool — plus a path to level up your design.
          </p>
        </div>

        {/* Input */}
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
            placeholder="Describe what you want to build or redesign... e.g. A job application tracker with kanban columns for Applied, Interview, Offer, Rejected. Each card shows company, role, date applied, and notes."
            rows={4}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              color: '#e5e5e5', fontSize: 15, lineHeight: 1.6, resize: 'vertical',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #1f1f1f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Target AI</span>
              <select
                value={targetAI}
                onChange={e => setTargetAI(e.target.value)}
                style={{
                  background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6,
                  color: '#e5e5e5', fontSize: 13, padding: '4px 8px', outline: 'none', cursor: 'pointer'
                }}
              >
                {TARGET_AIS.map(ai => <option key={ai} value={ai}>{ai}</option>)}
              </select>
            </div>
            <button
              onClick={() => generate()}
              disabled={loading || !goal.trim()}
              style={{
                background: loading || !goal.trim() ? '#1f1f1f' : '#e5e5e5',
                color: loading || !goal.trim() ? '#6b7280' : '#0a0a0a',
                border: 'none', borderRadius: 8, padding: '8px 20px',
                fontSize: 14, fontWeight: 500, cursor: loading || !goal.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {loading ? 'Generating...' : 'Generate prompt →'}
            </button>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#4b4b4b', marginBottom: 32 }}>⌘ + Enter to generate</p>

        {/* Error */}
        {error && (
          <div style={{ background: '#1a0a0a', border: '1px solid #3f1f1f', borderRadius: 8, padding: 16, marginBottom: 24, color: '#f87171', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[180, 80, 100].map((h, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, height: h, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Generated Prompt */}
            <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Generated Prompt</span>
                <button
                  onClick={copyPrompt}
                  style={{
                    background: copied ? '#14532d' : '#1a1a1a', border: `1px solid ${copied ? '#166534' : '#2a2a2a'}`,
                    borderRadius: 6, padding: '4px 12px', fontSize: 12, color: copied ? '#86efac' : '#9ca3af',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: 16, fontSize: 14, lineHeight: 1.75, color: '#d1d5db', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace' }}>
                {result.generated_prompt}
              </div>
            </div>

            {/* Level Path */}
            <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Level Up Path</span>
              </div>
              <div style={{ padding: 16 }}>

                {/* Current level */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    minWidth: 36, height: 36, borderRadius: 8, background: levelColor + '20',
                    border: `1px solid ${levelColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600, color: levelColor
                  }}>
                    {result.current_level}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5', marginBottom: 4 }}>
                      Current: {result.current_level_label}
                    </div>
                    <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
                      {result.current_level_summary}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingLeft: 18 }}>
                  <div style={{ width: 1, height: 24, background: '#2a2a2a' }} />
                </div>

                {/* Next level */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    minWidth: 36, height: 36, borderRadius: 8, background: nextColor + '15',
                    border: `1px dashed ${nextColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600, color: nextColor + 'aa'
                  }}>
                    {result.next_level}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
                      Next: {result.next_level_label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.next_level_actions.map((action, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: nextColor + '80', fontSize: 12, marginTop: 2, minWidth: 16 }}>→</span>
                          <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two column: techniques + refinements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f1f1f' }}>
                  <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Techniques Applied</span>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.techniques_applied.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#22c55e', fontSize: 11, marginTop: 3 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f1f1f' }}>
                  <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Make It Better</span>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.refinement_suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#f97316', fontSize: 11, marginTop: 3 }}>↑</span>
                      <span style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Refine */}
            <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
              {!refining ? (
                <button
                  onClick={() => setRefining(true)}
                  style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                >
                  + Add more context to refine this prompt
                </button>
              ) : (
                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>What would you like to add or change?</p>
                  <textarea
                    value={refineInput}
                    onChange={e => setRefineInput(e.target.value)}
                    placeholder="e.g. I have a dark navy + amber color scheme in mind, and I found a reference site on Dribbble I like..."
                    rows={3}
                    style={{
                      width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8,
                      color: '#e5e5e5', fontSize: 14, padding: 12, outline: 'none', resize: 'vertical',
                      fontFamily: 'Inter, sans-serif', marginBottom: 10
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={refine}
                      disabled={refineLoading || !refineInput.trim()}
                      style={{
                        flex: 1, background: refineLoading || !refineInput.trim() ? '#1f1f1f' : '#e5e5e5',
                        color: refineLoading || !refineInput.trim() ? '#6b7280' : '#0a0a0a',
                        border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13,
                        fontWeight: 500, cursor: refineLoading || !refineInput.trim() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {refineLoading ? 'Refining...' : 'Refine prompt →'}
                    </button>
                    <button
                      onClick={() => setRefining(false)}
                      style={{ background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Start over */}
            <button
              onClick={() => { setResult(null); setGoal(''); setError(''); setRefining(false) }}
              style={{ background: 'transparent', border: 'none', color: '#4b4b4b', fontSize: 13, cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}
            >
              ← Start over
            </button>

          </div>
        )}
      </div>
    </main>
  )
}
