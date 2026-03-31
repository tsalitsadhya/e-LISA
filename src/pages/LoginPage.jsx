import { useState } from 'react'
import { Eye, EyeOff, User, Lock } from 'lucide-react'

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { username: 'operator', password: 'user123', role: 'user', name: 'John Operator' },
  { username: 'adjustment', password: 'adj123', role: 'adjustment', name: 'Adjustment User' },
]

export default function LoginPage({ onLogin, onGoToSignUp, extraUsers = [] }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const USERS = [...DEFAULT_USERS, ...extraUsers]

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = USERS.find(u => u.username === username && u.password === password)

    if (found) {
      setError('')
      onLogin(found.role, found.name)
    } else {
      setError('Username atau password salah.')
    }
  }

  return (
    <div style={S.page}>

      {/* LEFT */}
      <div style={S.left}>
        <div>
          <div style={S.logoMain}>bintangtoedjoe</div>
          <div style={S.logoSub}>A Kalbe Company</div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={S.right}>
        <div style={S.card}>

          <h2 style={S.title}>Line Integrity & Sanitation Application</h2>
          <p style={S.subtitle}>Please enter your login details to continue.</p>

          <form onSubmit={handleSubmit} style={S.form}>

            <div style={S.inputWrap}>
              <User size={16}/>
              <input
                style={S.input}
                placeholder="Email"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div style={S.inputWrap}>
              <Lock size={16}/>
              <input
                style={S.input}
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>

            {error && <div style={S.error}>{error}</div>}

            <button style={S.loginBtn}>Log In</button>
          </form>

          {/* CREATE ACCOUNT */}
          <div style={S.signup}>
            Don't have an account?{' '}
            <span onClick={onGoToSignUp} style={S.link}>
              Create account
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}

const S = {
  page: { display: 'flex', height: '100vh' },
  left: { flex: 1, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  right: { flex: 1, background: '#174c8f', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  logoMain: { fontSize: 28, fontWeight: 700 },
  logoSub: { fontSize: 13, color: '#64748b' },

  card: { background: '#dbe4f0', padding: 30, borderRadius: 16, width: 400 },

  title: { fontWeight: 700 },
  subtitle: { fontSize: 13, marginBottom: 20 },

  form: { display: 'flex', flexDirection: 'column', gap: 12 },

  inputWrap: { display: 'flex', gap: 8, background: '#fff', padding: 10, borderRadius: 8 },
  input: { border: 'none', outline: 'none', flex: 1 },

  eyeBtn: { background: 'none', border: 'none' },

  loginBtn: { background: '#2f80ed', color: '#fff', padding: 10, border: 'none', borderRadius: 8 },

  signup: { marginTop: 15, fontSize: 13 },
  link: { color: '#1565c0', cursor: 'pointer', fontWeight: 600 },

  error: { color: 'red', fontSize: 12 },
}