'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mic, MicOff, Play, Loader2 } from 'lucide-react'
import { getSessionMessages } from '@/frontend/lib/api'
import type { Message } from '@/frontend/lib/types'

export default function VoiceSessionPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId') || ''
  const [messages, setMessages] = useState<Message[]>([])
  const [micEnabled, setMicEnabled] = useState(false)
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    async function loadMessages() {
      const data = await getSessionMessages(sessionId)
      setMessages(data)
      setLoading(false)
    }
    loadMessages()
  }, [sessionId])

  const handleMicPermission = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMicEnabled(true)
    } catch (error) {
      console.error('Microphone permission denied', error)
    }
  }

  const handleToggleListening = () => {
    setListening(!listening)
  }

  if (!sessionId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p style={{ color: 'var(--color-text-muted)' }}>No session selected</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      
      <div className="flex flex-col items-center gap-4">
        {!micEnabled ? (
          <button
            onClick={handleMicPermission}
            className="flex flex-col items-center gap-3 rounded-full border-2 p-8 transition-all"
            style={{
              borderColor: 'var(--color-accent)',
              backgroundColor: 'rgba(227, 155, 99, 0.1)',
            }}
          >
            <Mic className="h-12 w-12" style={{ color: 'var(--color-accent)' }} />
            <span className="font-medium" style={{ color: 'var(--color-text-dark)' }}>
              Enable microphone
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Click to grant permission
            </span>
          </button>
        ) : (
          <button
            onClick={handleToggleListening}
            className={`flex h-24 w-24 items-center justify-center rounded-full transition-all ${
              listening ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: listening ? '#dc2626' : 'var(--color-accent)',
              color: 'var(--color-text-light)',
            }}
          >
            {listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </button>
        )}
        {listening && (
          <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
            Listening…
          </p>
        )}
      </div>

      
      <div
        className="rounded-lg border-2 p-4"
        style={{
          borderColor: 'rgba(227, 155, 99, 0.2)',
          backgroundColor: 'var(--color-card-bg)',
        }}
      >
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>
          Transcript
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded"
                style={{ backgroundColor: 'rgba(227, 155, 99, 0.2)' }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No transcript yet. Start speaking to begin.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm" style={{ color: 'var(--color-text-dark)' }}>
                <span className="font-medium">{msg.role === 'user' ? 'You' : 'UrgeEase'}:</span>{' '}
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </div>

      
      {messages.some((m) => m.role === 'assistant') && (
        <div
          className="rounded-lg border-2 p-4"
          style={{
            borderColor: 'rgba(227, 155, 99, 0.2)',
            backgroundColor: 'rgba(227, 155, 99, 0.05)',
          }}
        >
          <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>
            Assistant Response
          </h3>
          <p className="mb-3 text-sm" style={{ color: 'var(--color-text-dark)' }}>
            {messages.filter((m) => m.role === 'assistant').slice(-1)[0]?.content}
          </p>
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-text-light)',
            }}
          >
            <Play className="h-4 w-4" />
            Play audio
          </button>
        </div>
      )}
    </div>
  )
}

