import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import logo from '../assets/logo_b7.png'
import { login } from '../lib/auth'

export default function LoginPage({ onLogin, onGoToSignUp }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (d) =>
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const formatTime = (d) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(username, password)
      onLogin(data.user.role, data.user.full_name, data.user)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Username atau password salah.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>

      {/* LEFT — Logo only */}
      <div style={S.left}>
        <img src={logo} alt="Bintang Toedjoe" style={S.logo} />
      </div>

      {/* RIGHT — Login */}
      <div style={S.right}>

        {/* Clock */}
        <div style={S.clock}>
          <div style={S.clockDate}>{formatDate(time)}</div>
          <div style={S.clockTime}>{formatTime(time)}</div>
        </div>

        <div style={S.card}>
          {/* Shield icon */}
          <div style={S.iconWrap}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="17" fill="#1a56db" />
              <path d="M17 7C17 7 11 13 11 19C11 22.3 13.7 25 17 25C20.3 25 23 22.3 23 19C23 13 17 7 17 7Z" fill="white" fillOpacity="0.9"/>
              <circle cx="23" cy="11" r="3" fill="#93c5fd"/>
              <path d="M22 9L25 8L24 11" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 style={S.title}>Line Integrity & Sanitation Application</h2>
          <p style={S.subtitle}>Masukkan kredensial Anda untuk melanjutkan</p>

          <form onSubmit={handleSubmit} style={S.form}>

            <div style={S.fieldGroup}>
              <label style={S.label}>Username</label>
              <div style={S.inputWrap}>
                <User size={15} color="#64748b" />
                <input
                  style={S.input}
                  placeholder="Masukkan username"
                  value={username}
                  autoComplete="username"
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap}>
                <Lock size={15} color="#64748b" />
                <input
                  style={S.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn}>
                  {showPass ? <EyeOff size={15} color="#64748b" /> : <Eye size={15} color="#64748b" />}
                </button>
              </div>
            </div>

            <div style={S.rememberRow}>
              <label style={S.rememberLabel}>
                <input type="checkbox" style={{ accentColor: '#1a56db' }} />
                <span style={{ marginLeft: 6 }}>Remember me</span>
              </label>
              <span style={S.forgot}>Forgot password?</span>
            </div>

            {error && (
              <div style={S.errorBox}>
                <span>⚠</span> {error}
              </div>
            )}

            <button style={{ ...S.loginBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Memproses...' : 'Log In'}
            </button>
          </form>

          <div style={S.divider}>
            <span style={S.dividerLine} />
            <span style={S.dividerText}>atau</span>
            <span style={S.dividerLine} />
          </div>

          <div style={S.support}>
            Mengalami kendala?{' '}
            <span style={S.link}>Hubungi support &rsaquo;</span>
          </div>
        </div>

        <div style={S.footer}>
          &copy; 2026 PT. Bintang Toedjoe — A Kalbe Company
        </div>
      </div>
    </div>
  )
}

const S = {
  page: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // LEFT
  left: {
    flex: 1,
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  logo: {
    maxWidth: '70%',
    maxHeight: '40%',
    objectFit: 'contain',
  },

  // RIGHT
  right: {
    flex: 1,
    background: '#174c8f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    position: 'relative',
  },

  // CLOCK
  clock: {
    position: 'absolute',
    top: 24,
    right: 28,
    textAlign: 'right',
    lineHeight: 1.3,
  },
  clockDate: {
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: 500,
    letterSpacing: 0.3,
  },
  clockTime: {
    fontSize: 22,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: 1.5,
  },

  // CARD
  card: {
    background: '#dbeafe',
    padding: '36px 40px',
    borderRadius: 20,
    width: 420,
    boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
  },
  iconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    margin: '0 0 24px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#334155',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#ffffff',
    border: '1.5px solid #cbd5e1',
    padding: '10px 14px',
    borderRadius: 10,
  },
  input: {
    border: 'none',
    outline: 'none',
    flex: 1,
    fontSize: 14,
    background: 'transparent',
    color: '#0f172a',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
  },
  rememberRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: 13,
    color: '#334155',
  },
  forgot: {
    color: '#1d4ed8',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 12,
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  loginBtn: {
    background: '#1d4ed8',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: 0.3,
    boxShadow: '0 2px 10px rgba(29,78,216,0.3)',
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '18px 0 14px',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: '#93c5fd',
    opacity: 0.5,
  },
  dividerText: {
    fontSize: 12,
    color: '#64748b',
  },
  support: {
    textAlign: 'center',
    fontSize: 13,
    color: '#475569',
  },
  link: {
    color: '#1d4ed8',
    cursor: 'pointer',
    fontWeight: 600,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    fontSize: 11,
    color: '#93c5fd',
    opacity: 0.7,
  },
}
