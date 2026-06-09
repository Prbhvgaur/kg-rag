import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { assertSupabaseReachable, supabase } from '../lib/supabase'
import { colors } from '../lib/design'
import { Navbar } from '../components/Navbar'

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await assertSupabaseReachable()
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Check your email to confirm your account!')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        setSuccess('Password reset link sent to your email!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await assertSupabaseReachable()
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google sign-in is unavailable.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10" style={{ backgroundColor: 'transparent' }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div 
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-[32px] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.7)]" 
          style={{ backgroundColor: colors.bg.glass, backdropFilter: 'blur(32px)' }}
        >
          {/* Branding/Info Side */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-amber-500/10 to-transparent border-r border-white/5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-6 block">Protected Workspace</span>
              <h2 className="text-4xl font-black leading-tight text-white mb-6">
                Sign in to secure ingestion, graph access, and grounded queries.
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                Authentication gates every API route now, so only signed-in users can upload files, query the corpus, or inspect the knowledge graph.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pb-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-500">Protected ingestion endpoints</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-500">Supabase email/password auth</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-500">Bearer token verification on the backend</p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="md:hidden text-center mb-8">
               <h1 className="text-2xl font-black text-white">KG<span className="text-amber-500">-RAG</span></h1>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-900/50 rounded-2xl mb-8 border border-white/5">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'register' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2">
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create your workspace account' : 'Reset Password'}
              </h3>
              <p className="text-sm font-medium text-slate-400">
                Use your Supabase-backed account to enter the KG-RAG workspace.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-14 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>
                <p className="text-[10px] text-center font-bold text-slate-500 px-4 leading-relaxed">
                  Note: Google OAuth must be enabled in your <span className="text-amber-500/80">Supabase Dashboard</span> under Authentication &gt; Providers.
                </p>
              </div>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-4 bg-transparent text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Email</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-all font-medium"
                  placeholder="you@company.com"
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:brightness-125">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-all font-medium"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}

              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 text-center">{error}</div>}
              {success && <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-500 text-center">{success}</div>}

              <div className="pt-2 space-y-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-amber-500/10"
                >
                  {loading ? 'Working...' : mode === 'login' ? 'Enter Workspace' : mode === 'register' ? 'Initialize Account' : 'Request Link'}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem('demo_mode', 'true')
                    window.location.href = '/dashboard'
                  }}
                  className="w-full h-14 rounded-2xl border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white/5 hover:text-white"
                >
                  Enter Workspace as Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
