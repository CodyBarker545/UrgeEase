import type {
  User,
  SessionSummary,
  Message,
  SendMessageResponse,
  ResultsSummary,
  AddictionDetail,
  SignUpRequest,
  VerifyEmailRequest,
  SignInRequest,
  CreateSessionRequest,
  SendMessageRequest,
  AuthResponse,
} from './types'

const STORAGE_KEYS = {
  USERS: 'urgeease_mock_users',
  SESSIONS: 'urgeease_mock_sessions',
  MESSAGES: 'urgeease_mock_messages',
  SESSIONS_COMPLETED: 'urgeease_sessions_completed',
}
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to localStorage', e)
  }
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export async function signUp(data: SignUpRequest): Promise<AuthResponse> {
  await delay(800)
  const users = getStorage<User[]>(STORAGE_KEYS.USERS, [])
  
  if (users.some((u) => u.email === data.email)) {
    return { ok: false, error: 'Email already registered' }
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.name,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  setStorage(STORAGE_KEYS.USERS, users)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`verify_${data.email}`, '123456')
  }

  return { ok: true }
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
  await delay(600)
  const storedCode = typeof window !== 'undefined' ? sessionStorage.getItem(`verify_${data.email}`) : null
  if (data.code !== '123456' && data.code !== storedCode) {
    return { ok: false, error: 'Invalid verification code' }
  }

  const users = getStorage<User[]>(STORAGE_KEYS.USERS, [])
  const user = users.find((u) => u.email === data.email)
  if (!user) {
    return { ok: false, error: 'User not found' }
  }

  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return { ok: true, token, user }
}

export async function signIn(data: SignInRequest): Promise<AuthResponse> {
  await delay(600)
  const users = getStorage<User[]>(STORAGE_KEYS.USERS, [])
  const user = users.find((u) => u.email === data.email)

  if (!user) {
    return { ok: false, error: 'Invalid email or password' }
  }
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return { ok: true, token, user }
}

export async function getMe(): Promise<User | null> {
  await delay(300)
  const token = typeof window !== 'undefined' ? localStorage.getItem('urgeease-auth') : null
  if (!token) return null

  try {
    const authData = JSON.parse(token || '{}')
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, [])
    return users.find((u) => u.id === authData.state?.user?.id) || null
  } catch {
    return null
  }
}
export async function createSession(data: CreateSessionRequest): Promise<{ sessionId: string }> {
  await delay(400)
  const sessions = getStorage<SessionSummary[]>(STORAGE_KEYS.SESSIONS, [])
  const sessionId = `session_${Date.now()}`
  
  const newSession: SessionSummary = {
    id: sessionId,
    mode: data.mode,
    createdAt: new Date().toISOString(),
    messageCount: 0,
  }

  sessions.push(newSession)
  setStorage(STORAGE_KEYS.SESSIONS, sessions)

  return { sessionId }
}

export async function getSessions(): Promise<SessionSummary[]> {
  await delay(300)
  return getStorage<SessionSummary[]>(STORAGE_KEYS.SESSIONS, [])
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  await delay(300)
  const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, [])
  return messages.filter((m) => m.sessionId === sessionId).sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export async function sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
  await delay(1200) 

  const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, [])
  const sessions = getStorage<SessionSummary[]>(STORAGE_KEYS.SESSIONS, [])
  const userMessage: Message = {
    id: `msg_${Date.now()}_user`,
    sessionId: data.sessionId,
    role: 'user',
    content: data.text,
    createdAt: new Date().toISOString(),
    mode: data.mode,
  }
  messages.push(userMessage)
  const responses = [
    "I hear you. Let's take a moment to notice what's happening without judgment.",
    "That sounds difficult. What do you notice in your body right now?",
    "It's okay to feel this way. These feelings will pass. Can you name one thing you're grateful for today?",
    "I'm here with you. Let's try a simple breathing exercise: breathe in for 4 counts, hold for 4, out for 4.",
  ]
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]

  const assistantMessage: Message = {
    id: `msg_${Date.now()}_assistant`,
    sessionId: data.sessionId,
    role: 'assistant',
    content: randomResponse,
    createdAt: new Date().toISOString(),
    mode: data.mode,
  }
  messages.push(assistantMessage)
  const session = sessions.find((s) => s.id === data.sessionId)
  if (session) {
    session.messageCount = messages.filter((m) => m.sessionId === data.sessionId).length
    session.lastMessageAt = new Date().toISOString()
  }

  setStorage(STORAGE_KEYS.MESSAGES, messages)
  setStorage(STORAGE_KEYS.SESSIONS, sessions)
  const crisisFlag = Math.random() > 0.9 && data.text.toLowerCase().includes('hurt')

  return {
    assistantMessage,
    crisisFlag,
  }
}
export async function getResults(): Promise<ResultsSummary> {
  await delay(400)
  const sessions = getStorage<SessionSummary[]>(STORAGE_KEYS.SESSIONS, [])
  const sessionsCompleted = sessions.filter((s) => s.messageCount > 0).length

  const unlocked = sessionsCompleted >= 3

  const addictions: ResultsSummary['addictions'] = unlocked
    ? [
        {
          id: 'social_media',
          name: 'Social Media',
          confidence: 78,
          topTriggers: ['Evening hours', 'Boredom', 'Bedroom', 'Negative thoughts'],
        },
        {
          id: 'pornography',
          name: 'Pornography',
          confidence: 65,
          topTriggers: ['Stress', 'Loneliness', 'Late night', 'Alone time'],
        },
      ]
    : []

  return {
    sessionsCompleted,
    addictions,
    unlocked,
  }
}

export async function getAddictionDetail(addictionId: string): Promise<AddictionDetail | null> {
  await delay(300)
  
  if (addictionId === 'social_media') {
    return {
      id: 'social_media',
      name: 'Social Media',
      confidence: 78,
      triggers: [
        {
          category: 'temporal',
          triggers: ['Evening hours (6-10pm)', 'Weekend mornings'],
          count: 12,
        },
        {
          category: 'emotional',
          triggers: ['Boredom', 'Anxiety', 'Loneliness'],
          count: 8,
        },
        {
          category: 'environmental',
          triggers: ['Bedroom', 'Couch', 'Alone'],
          count: 10,
        },
        {
          category: 'cognitive',
          triggers: ['Negative thoughts', 'Comparison', 'FOMO'],
          count: 6,
        },
      ],
      evidence: [
        {
          id: 'ev1',
          sessionId: 'session_1',
          excerpt: 'I noticed I was scrolling when I felt anxious about work.',
          timestamp: '2026-02-05T20:30:00Z',
        },
        {
          id: 'ev2',
          sessionId: 'session_2',
          excerpt: 'Every evening around 8pm I reach for my phone automatically.',
          timestamp: '2026-02-06T20:15:00Z',
        },
      ],
    }
  }

  if (addictionId === 'pornography') {
    return {
      id: 'pornography',
      name: 'Pornography',
      confidence: 65,
      triggers: [
        {
          category: 'temporal',
          triggers: ['Late night (11pm-2am)', 'Early morning'],
          count: 7,
        },
        {
          category: 'emotional',
          triggers: ['Stress', 'Loneliness', 'Rejection'],
          count: 9,
        },
        {
          category: 'environmental',
          triggers: ['Alone', 'Bedroom', 'Private space'],
          count: 8,
        },
        {
          category: 'cognitive',
          triggers: ['Escapism', 'Numbing', 'Self-soothing'],
          count: 5,
        },
      ],
      evidence: [
        {
          id: 'ev3',
          sessionId: 'session_3',
          excerpt: 'When I feel stressed, I use it to escape.',
          timestamp: '2026-02-07T23:45:00Z',
        },
      ],
    }
  }

  return null
}
export async function exportData(): Promise<{ downloadUrl: null }> {
  await delay(800)
  return { downloadUrl: null }
}

export async function deleteAccount(): Promise<{ ok: boolean }> {
  await delay(600)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('urgeease-auth')
    localStorage.removeItem('urgeease-preferences')
    localStorage.removeItem('urgeease-onboarding')
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
    localStorage.removeItem(STORAGE_KEYS.MESSAGES)
    localStorage.removeItem(STORAGE_KEYS.SESSIONS_COMPLETED)
  }
  return { ok: true }
}


