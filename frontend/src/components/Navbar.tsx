import React from 'react'
import { Link } from 'react-router-dom'
import { colors } from '../lib/design'
import { useAuth } from '../hooks/useAuth'

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <nav 
      className="h-20 px-8 flex items-center justify-between border-b sticky top-0 z-50 backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(10, 15, 30, 0.7)', borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      
      <Link to="/" className="flex flex-col relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-0.5">Knowledge Graph RAG</span>
        <span className="text-xl font-black tracking-tighter" style={{ color: colors.text.primary }}>
          KG<span className="text-amber-500">-RAG</span>
        </span>
      </Link>

      <div className="flex items-center gap-8 relative z-10">
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'Workflow', 'Pricing', 'API Docs'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button 
                onClick={signOut}
                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95 border border-white/10"
                style={{ color: colors.text.primary }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black bg-amber-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20">
                Sign In
              </Link>
              <Link 
                to="/auth?mode=register"
                className="hidden sm:block px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95 border border-white/10"
                style={{ color: colors.text.primary }}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
