/**
 * Tiny 8-bit sound engine built on the Web Audio API.
 *
 * Every effect is synthesised on the fly with oscillators, so the site ships
 * zero audio files. The AudioContext is created lazily on the first sound
 * (browsers only allow audio after a user gesture anyway).
 *
 * Mute state is persisted in localStorage and exposed through a tiny
 * subscribe API so React components can stay in sync (see useSound).
 */

type Wave = OscillatorType

type ToneOptions = {
  freq: number
  /** Optional end frequency for a pitch slide */
  to?: number
  duration: number
  type?: Wave
  volume?: number
  delay?: number
}

const STORAGE_KEY = 'lk-arcade-muted'
const MASTER_VOLUME = 0.16

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = readMuted()
const listeners = new Set<(muted: boolean) => void>()

function readMuted() {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return null
    ctx = new AudioCtor()
    master = ctx.createGain()
    master.gain.value = MASTER_VOLUME
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  return ctx
}

function tone({ freq, to, duration, type = 'square', volume = 1, delay = 0 }: ToneOptions) {
  if (muted) return
  const audio = getContext()
  if (!audio || !master) return

  const start = audio.currentTime + delay
  const osc = audio.createOscillator()
  const gain = audio.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (to) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration)
  }

  // Short attack + exponential decay keeps the chiptune "pluck" feel
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(gain)
  gain.connect(master)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** White-noise burst, used for knocks and impacts */
function noise(duration: number, volume = 0.6, delay = 0, filterFreq = 900) {
  if (muted) return
  const audio = getContext()
  if (!audio || !master) return

  const length = Math.floor(audio.sampleRate * duration)
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length)
  }

  const source = audio.createBufferSource()
  source.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = filterFreq
  const gain = audio.createGain()
  gain.gain.value = volume

  source.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  source.start(audio.currentTime + delay)
}

export const sfx = {
  hover: () => tone({ freq: 880, duration: 0.04, type: 'square', volume: 0.18 }),
  select: () => {
    tone({ freq: 523, duration: 0.07, volume: 0.5 })
    tone({ freq: 784, duration: 0.09, volume: 0.5, delay: 0.06 })
  },
  back: () => {
    tone({ freq: 660, duration: 0.07, volume: 0.4 })
    tone({ freq: 440, duration: 0.09, volume: 0.4, delay: 0.06 })
  },
  /** Classic two-note coin pickup */
  coin: () => {
    tone({ freq: 988, duration: 0.08, volume: 0.55 })
    tone({ freq: 1319, duration: 0.32, volume: 0.55, delay: 0.08 })
  },
  error: () => {
    tone({ freq: 220, to: 110, duration: 0.25, type: 'sawtooth', volume: 0.5 })
    tone({ freq: 160, to: 80, duration: 0.3, type: 'square', volume: 0.35, delay: 0.08 })
  },
  /** Very short tick played while text is being typed */
  blip: (pitch = 1) => tone({ freq: 420 * pitch, duration: 0.03, type: 'square', volume: 0.12 }),
  knock: () => {
    noise(0.09, 0.9, 0, 500)
    tone({ freq: 110, to: 60, duration: 0.1, type: 'sine', volume: 0.9 })
  },
  door: () => {
    noise(0.5, 0.35, 0, 1400)
    tone({ freq: 180, to: 520, duration: 0.5, type: 'triangle', volume: 0.5 })
  },
  powerUp: () => {
    ;[523, 659, 784, 1047, 1319].forEach((freq, i) =>
      tone({ freq, duration: 0.09, volume: 0.45, delay: i * 0.06 }),
    )
  },
  achievement: () => {
    ;[784, 988, 1175, 1568].forEach((freq, i) =>
      tone({ freq, duration: 0.14, type: 'triangle', volume: 0.6, delay: i * 0.09 }),
    )
    tone({ freq: 1568, duration: 0.5, type: 'square', volume: 0.25, delay: 0.36 })
  },
  start: () => {
    ;[392, 523, 659, 784].forEach((freq, i) =>
      tone({ freq, duration: 0.12, volume: 0.5, delay: i * 0.08 }),
    )
  },
  whoosh: () => noise(0.25, 0.3, 0, 2200),
}

export function isMuted() {
  return muted
}

export function setMuted(value: boolean) {
  muted = value
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    // Storage can be unavailable (private mode) — the in-memory flag still works
  }
  listeners.forEach((listener) => listener(value))
}

export function subscribeMuted(listener: (muted: boolean) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
