import { useState } from 'react'
import { User, Lock, Mail } from 'lucide-react'

export default function SignUpPage({ onBackToLogin, onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name || !email || !password) {
      return setError('Semua field harus diisi')
    }

    if (password !== confirm) {
      return setError('Password tidak sama')
    }

    onRegister({
      username: email,
      password,
      role: 'user',
      name,
    })

    onBackToLogin(email)
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

          <h2 style={S.title}>Create Account</h2>
          <p style={S.subtitle}>Sign up to continue</p>

          <form onSubmit={handleSubmit} style={S.form}>

            <div style={S.inputWrap}>
              <User size={16}/>
              <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={S.input}/>
            </div>

            <div style={S.inputWrap}>
              <Mail size={16}/>
              <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={S.input}/>
            </div>

            <div style={S.inputWrap}>
              <Lock size={16}/>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={S.input}/>
            </div>

            <div style={S.inputWrap}>
              <Lock size={16}/>
              <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} style={S.input}/>
            </div>

            {error && <div style={S.error}>{error}</div>}

            <button style={S.btn}>Create Account</button>
          </form>

          <div style={S.back}>
            Already have an account?{' '}
            <span onClick={() => onBackToLogin()} style={S.link}>
              Login
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

  btn: { background: '#2f80ed', color: '#fff', padding: 10, border: 'none', borderRadius: 8 },

  back: { marginTop: 15, fontSize: 13 },
  link: { color: '#1565c0', cursor: 'pointer', fontWeight: 600 },

  error: { color: 'red', fontSize: 12 },
}